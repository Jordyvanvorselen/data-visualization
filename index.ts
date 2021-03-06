class Startup {
  public storyFinished: boolean = false;
  public firstPageFinished: boolean = false;
  public secondPageFinished: boolean = false;
  public thirdPageFinished: boolean = false;

  public create_ball_chart(svgSelector: string, dataPath: string): void {
    var svg = d3.select(svgSelector),
      width = +svg.attr("width"),
      height = +svg.attr("height");

    var format = d3.format(",d");

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var pack = d3
      .pack()
      .size([width, height])
      .padding(1.5);

    d3.csv(
      dataPath,
      function(d: any) {
        d.value = +d.value;
        if (d.value) return d;
      },
      function(error, classes) {
        if (error) throw error;

        var root = d3
          .hierarchy({ children: classes })
          .sum(function(d: any) {
            return d.value;
          })
          .each(function(d: any) {
            if ((id = d.data.id)) {
              var id,
                i = id.lastIndexOf(".");
              d.id = id;
              d.package = id.slice(0, i);
              d.class = id.slice(i + 1);
            }
          });

        var node = svg
          .selectAll(".node")
          .data(pack(root).leaves())
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", function(d: any) {
            return "translate(" + d.x + "," + d.y + ")";
          });

        node
          .append("circle")
          .attr("id", function(d: any) {
            return d.id;
          })
          .attr("r", function(d: any) {
            return d.r;
          })
          .style("fill", function(d: any) {
            return color(d.id);
          });

        node
          .append("clipPath")
          .attr("id", function(d) {
            return "clip-" + d.id;
          })
          .append("use")
          .attr("xlink:href", function(d) {
            return "#" + d.id;
          });

        node
          .append("text")
          .attr("clip-path", function(d) {
            return "url(#clip-" + d.id + ")";
          })
          .selectAll("tspan")
          .data(function(d: any) {
            return d.class.split(/(?=[A-Z][^A-Z])/g);
          })
          .enter()
          .append("tspan")
          .attr("x", 0)
          .attr("y", function(d, i, nodes) {
            return 13 + (i - nodes.length / 2 - 0.5) * 10;
          })
          .text(function(d: any) {
            return d;
          });

        node.append("title").text(function(d) {
          return d.id + "\n" + format(d.value);
        });

        d3.selectAll("circle").attr("class", "fade");
      }
    );
  }

  public progressStory(
    text: string,
    delay: number,
    callback: any,
    fadeOut: boolean = true
  ): any {
    var elem: JQuery = $(".story-text");
    elem.text(text);

    if (fadeOut) {
      elem
        .fadeIn(1000)
        .delay(delay)
        .fadeOut(1000)
        .delay(1000)
        .fadeOut(0, () => callback());
    } else {
      elem.fadeIn(2000).delay(delay);

      callback();
    }
  }

  public createLineChart() {
    var svg = d3.select("svg.linechart"),
      margin = { top: 20, right: 20, bottom: 30, left: 50 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseTime = d3.timeParse("%d-%b-%y");

    var x = d3.scaleTime().rangeRound([0, width]);

    var y = d3.scaleLinear().rangeRound([height, 0]);

    var line = d3
      .line()
      .x(function(d: any) {
        return x(d.date);
      })
      .y(function(d: any) {
        return y(d.close);
      });

    d3.tsv(
      "linechart.tsv",
      function(d: any) {
        d.date = parseTime(d.date);
        d.close = +d.close;
        return d;
      },
      function(error, data) {
        if (error) throw error;

        x.domain(
          d3.extent(data, function(d) {
            return d.date;
          })
        );
        y.domain([0, 100]);

        g
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
          .select(".domain")
          .remove();

        g
          .append("g")
          .call(d3.axisLeft(y))
          .append("text")
          .attr("fill", "#000")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Knockouts (%)");

        g
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);
      }
    );
  }

  public createBarChart() {
    var svg = d3.select("svg.barchart"),
      margin = { top: 20, right: 20, bottom: 30, left: 40 },
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

    var x = d3
        .scaleBand()
        .rangeRound([0, width])
        .padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

    var g = svg
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv(
      "barchart.tsv",
      function(d: any) {
        d.frequency = +d.frequency;
        return d;
      },
      function(error, data) {
        if (error) throw error;

        x.domain(
          data.map(function(d) {
            return d.letter;
          })
        );
        y.domain([
          0,
          d3.max(data, function(d: any) {
            return d.frequency;
          })
        ]);

        g
          .append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        g
          .append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y).ticks(10, "%"))
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");

        g
          .selectAll(".bar")
          .data(data)
          .enter()
          .append("rect")
          .attr("class", "bar")
          .attr("x", function(d: any) {
            return x(d.letter);
          })
          .attr("y", function(d: any) {
            return y(d.frequency);
          })
          .attr("width", x.bandwidth())
          .attr("height", function(d: any) {
            return height - y(d.frequency);
          });
      }
    );
  }

  public startStory(fullpageElem: any) {
    this.progressStory(
      "Do you think the UFC got more exciting in the last decades?",
      2000,
      () =>
        this.progressStory("Maybe it did", 500, () =>
          this.progressStory(
            "Let's take a look at the amount of events and locations",
            1000,
            () => {
              $(".main.title.story-text")
                .animate(
                  {
                    bottom: "80%"
                  },
                  1000
                )
                .delay(500)
                .fadeIn(0, () => {
                  $(".chart-1").animate(
                    {
                      opacity: 1
                    },
                    2000,
                    () => {
                      $(".chart-2").animate(
                        {
                          opacity: 1
                        },
                        2000,
                        () => {
                          $(".chart-3").animate(
                            {
                              opacity: 1
                            },
                            2000,
                            () => {
                              $(".chart-4").animate(
                                {
                                  opacity: 1
                                },
                                2000,
                                () => {
                                  fullpageElem.fullpage.setAllowScrolling(true);
                                  fullpageElem.fullpage.setMouseWheelScrolling(
                                    true
                                  );
                                  $(".arrow.down").fadeIn(1000);
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                });
            },
            false
          )
        )
    );
  }

  public startStorySecondPage(fullpageElem: any) {
    fullpageElem.fullpage.moveSectionDown();
    $(".main.title.second-page")
      .delay(1500)
      .animate(
        {
          paddingTop: "5%"
        },
        1000,
        () => {
          $(".linechart")
            .animate(
              {
                opacity: 1
              },
              1000
            )
            .delay(1000)
            .fadeIn(0, () => {
              fullpageElem.fullpage.setAllowScrolling(true);
              fullpageElem.fullpage.setMouseWheelScrolling(true);
              $(".arrow.down.second-page").animate(
                {
                  opacity: 1
                },
                1000
              );
            });
        }
      );
  }

  public startStoryThirdPage(fullpageElem: any) {
    fullpageElem.fullpage.moveSectionDown();
    $(".main.title.third-page")
      .delay(1500)
      .animate(
        {
          paddingTop: "5%"
        },
        1000,
        () => {
          $(".barchart")
            .animate(
              {
                opacity: 1
              },
              1000
            )
            .delay(1000)
            .fadeIn(0, () => {
              fullpageElem.fullpage.setAllowScrolling(true);
              fullpageElem.fullpage.setMouseWheelScrolling(true);
              $(".arrow.down.third-page").animate(
                {
                  opacity: 1
                },
                1000
              );
            });
        }
      );
  }

  public fullpage(): any {
    var elem: any = $("#fullpage");
    elem.fullpage({
      sectionsColor: ["#283048", "lightgray", "#283048", "lightgray"],
      css3: true,
      slidesNavigation: true,
      slidesNavPosition: "bottom",
      onLeave: (index, nextIndex, direction) => {
        if (!this.storyFinished) {
          elem.fullpage.setAllowScrolling(false);
          elem.fullpage.setMouseWheelScrolling(false);
        }

        if (index == 1) {
          if (!this.storyFinished && !this.firstPageFinished) {
            var storyElem: JQuery = $(".story-text");
            storyElem.fadeOut(1000, () => {
              storyElem
                .text("Seems like the UFC is a lot more popular nowadays")
                .fadeIn(4000, () => this.startStorySecondPage(elem));
            });

            this.firstPageFinished = true;
            return false;
          }
        }

        if (index == 2) {
          if (!this.storyFinished && !this.secondPageFinished) {
            var storyElem: JQuery = $(".main.title.second-page");
            storyElem.fadeOut(1000, () => {
              storyElem
                .text("Mhm, the knockout ratio's didn't get any worse")
                .fadeIn(4000, () => this.startStoryThirdPage(elem));
            });

            this.secondPageFinished = true;
            return false;
          }
        }

        if (index == 3) {
          if (!this.storyFinished && !this.thirdPageFinished) {
            var storyElem: JQuery = $(".main.title.third-page");
            storyElem.fadeOut(1000, () => {
              storyElem
                .text("The UFC got more professional it seems")
                .fadeIn(4000, () => {
                  elem.fullpage.moveSectionDown();
                  this.storyFinished = true;
                  elem.fullpage.setAllowScrolling(true);
                  elem.fullpage.setMouseWheelScrolling(true);
                });
            });

            this.thirdPageFinished = true;
            return false;
          }
        }

        if (index > nextIndex && !this.storyFinished) {
          return false;
        }
      },
      afterRender: () => {
        new Startup().create_ball_chart("svg.chart1", "ballchart-data.csv");
        new Startup().create_ball_chart("svg.chart2", "ballchart-data-2.csv");
        new Startup().create_ball_chart("svg.chart3", "ballchart-data-3.csv");
        new Startup().create_ball_chart("svg.chart4", "ballchart-data-4.csv");
        new Startup().createLineChart();
        new Startup().createBarChart();
      }
    });

    elem.fullpage.setAllowScrolling(false);
    elem.fullpage.setMouseWheelScrolling(false);

    this.startStory(elem);
  }
}

new Startup().fullpage();
