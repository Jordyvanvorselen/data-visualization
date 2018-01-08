var Startup = /** @class */ (function () {
    function Startup() {
        this.storyFinished = false;
        this.firstPageFinished = false;
        this.secondPageFinished = false;
        this.thirdPageFinished = false;
    }
    Startup.prototype.create_ball_chart = function (svgSelector, dataPath) {
        var svg = d3.select(svgSelector), width = +svg.attr("width"), height = +svg.attr("height");
        var format = d3.format(",d");
        var color = d3.scaleOrdinal(d3.schemeCategory20c);
        var pack = d3
            .pack()
            .size([width, height])
            .padding(1.5);
        d3.csv(dataPath, function (d) {
            d.value = +d.value;
            if (d.value)
                return d;
        }, function (error, classes) {
            if (error)
                throw error;
            var root = d3
                .hierarchy({ children: classes })
                .sum(function (d) {
                return d.value;
            })
                .each(function (d) {
                if ((id = d.data.id)) {
                    var id, i = id.lastIndexOf(".");
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
                .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            node
                .append("circle")
                .attr("id", function (d) {
                return d.id;
            })
                .attr("r", function (d) {
                return d.r;
            })
                .style("fill", function (d) {
                return color(d.id);
            });
            node
                .append("clipPath")
                .attr("id", function (d) {
                return "clip-" + d.id;
            })
                .append("use")
                .attr("xlink:href", function (d) {
                return "#" + d.id;
            });
            node
                .append("text")
                .attr("clip-path", function (d) {
                return "url(#clip-" + d.id + ")";
            })
                .selectAll("tspan")
                .data(function (d) {
                return d.class.split(/(?=[A-Z][^A-Z])/g);
            })
                .enter()
                .append("tspan")
                .attr("x", 0)
                .attr("y", function (d, i, nodes) {
                return 13 + (i - nodes.length / 2 - 0.5) * 10;
            })
                .text(function (d) {
                return d;
            });
            node.append("title").text(function (d) {
                return d.id + "\n" + format(d.value);
            });
            d3.selectAll("circle").attr("class", "fade");
        });
    };
    Startup.prototype.progressStory = function (text, delay, callback, fadeOut) {
        if (fadeOut === void 0) { fadeOut = true; }
        var elem = $(".story-text");
        elem.text(text);
        if (fadeOut) {
            elem
                .fadeIn(1000)
                .delay(delay)
                .fadeOut(1000)
                .delay(1000)
                .fadeOut(0, function () { return callback(); });
        }
        else {
            elem.fadeIn(2000).delay(delay);
            callback();
        }
    };
    Startup.prototype.createLineChart = function () {
        var svg = d3.select("svg.linechart"), margin = { top: 20, right: 20, bottom: 30, left: 50 }, width = +svg.attr("width") - margin.left - margin.right, height = +svg.attr("height") - margin.top - margin.bottom, g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        var parseTime = d3.timeParse("%d-%b-%y");
        var x = d3.scaleTime().rangeRound([0, width]);
        var y = d3.scaleLinear().rangeRound([height, 0]);
        var line = d3
            .line()
            .x(function (d) {
            return x(d.date);
        })
            .y(function (d) {
            return y(d.close);
        });
        d3.tsv("linechart.tsv", function (d) {
            d.date = parseTime(d.date);
            d.close = +d.close;
            return d;
        }, function (error, data) {
            if (error)
                throw error;
            x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
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
        });
    };
    Startup.prototype.createBarChart = function () {
        var svg = d3.select("svg.barchart"), margin = { top: 20, right: 20, bottom: 30, left: 40 }, width = +svg.attr("width") - margin.left - margin.right, height = +svg.attr("height") - margin.top - margin.bottom;
        var x = d3
            .scaleBand()
            .rangeRound([0, width])
            .padding(0.1), y = d3.scaleLinear().rangeRound([height, 0]);
        var g = svg
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        d3.tsv("barchart.tsv", function (d) {
            d.frequency = +d.frequency;
            return d;
        }, function (error, data) {
            if (error)
                throw error;
            x.domain(data.map(function (d) {
                return d.letter;
            }));
            y.domain([
                0,
                d3.max(data, function (d) {
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
                .attr("x", function (d) {
                return x(d.letter);
            })
                .attr("y", function (d) {
                return y(d.frequency);
            })
                .attr("width", x.bandwidth())
                .attr("height", function (d) {
                return height - y(d.frequency);
            });
        });
    };
    Startup.prototype.startStory = function (fullpageElem) {
        var _this = this;
        this.progressStory("Do you think the UFC got more exciting in the last decades?", 2000, function () {
            return _this.progressStory("Maybe it did", 500, function () {
                return _this.progressStory("Let's take a look at the amount of events and locations", 1000, function () {
                    $(".main.title.story-text")
                        .animate({
                        bottom: "80%"
                    }, 1000)
                        .delay(500)
                        .fadeIn(0, function () {
                        $(".chart-1").animate({
                            opacity: 1
                        }, 2000, function () {
                            $(".chart-2").animate({
                                opacity: 1
                            }, 2000, function () {
                                $(".chart-3").animate({
                                    opacity: 1
                                }, 2000, function () {
                                    $(".chart-4").animate({
                                        opacity: 1
                                    }, 2000, function () {
                                        fullpageElem.fullpage.setAllowScrolling(true);
                                        fullpageElem.fullpage.setMouseWheelScrolling(true);
                                        $(".arrow.down").fadeIn(1000);
                                    });
                                });
                            });
                        });
                    });
                }, false);
            });
        });
    };
    Startup.prototype.startStorySecondPage = function (fullpageElem) {
        fullpageElem.fullpage.moveSectionDown();
        $(".main.title.second-page")
            .delay(1500)
            .animate({
            paddingTop: "5%"
        }, 1000, function () {
            $(".linechart")
                .animate({
                opacity: 1
            }, 1000)
                .delay(1000)
                .fadeIn(0, function () {
                fullpageElem.fullpage.setAllowScrolling(true);
                fullpageElem.fullpage.setMouseWheelScrolling(true);
                $(".arrow.down.second-page").animate({
                    opacity: 1
                }, 1000);
            });
        });
    };
    Startup.prototype.startStoryThirdPage = function (fullpageElem) {
        fullpageElem.fullpage.moveSectionDown();
        $(".main.title.third-page")
            .delay(1500)
            .animate({
            paddingTop: "5%"
        }, 1000, function () {
            $(".barchart")
                .animate({
                opacity: 1
            }, 1000)
                .delay(1000)
                .fadeIn(0, function () {
                fullpageElem.fullpage.setAllowScrolling(true);
                fullpageElem.fullpage.setMouseWheelScrolling(true);
                $(".arrow.down.third-page").animate({
                    opacity: 1
                }, 1000);
            });
        });
    };
    Startup.prototype.fullpage = function () {
        var _this = this;
        var elem = $("#fullpage");
        elem.fullpage({
            sectionsColor: ["#283048", "lightgray", "#283048", "lightgray"],
            css3: true,
            slidesNavigation: true,
            slidesNavPosition: "bottom",
            onLeave: function (index, nextIndex, direction) {
                if (!_this.storyFinished) {
                    elem.fullpage.setAllowScrolling(false);
                    elem.fullpage.setMouseWheelScrolling(false);
                }
                if (index == 1) {
                    if (!_this.storyFinished && !_this.firstPageFinished) {
                        var storyElem = $(".story-text");
                        storyElem.fadeOut(1000, function () {
                            storyElem
                                .text("Seems like the UFC is a lot more popular nowadays")
                                .fadeIn(4000, function () { return _this.startStorySecondPage(elem); });
                        });
                        _this.firstPageFinished = true;
                        return false;
                    }
                }
                if (index == 2) {
                    if (!_this.storyFinished && !_this.secondPageFinished) {
                        var storyElem = $(".main.title.second-page");
                        storyElem.fadeOut(1000, function () {
                            storyElem
                                .text("Mhm, the knockout ratio's didn't get any worse")
                                .fadeIn(4000, function () { return _this.startStoryThirdPage(elem); });
                        });
                        _this.secondPageFinished = true;
                        return false;
                    }
                }
                if (index == 3) {
                    if (!_this.storyFinished && !_this.thirdPageFinished) {
                        var storyElem = $(".main.title.third-page");
                        storyElem.fadeOut(1000, function () {
                            storyElem
                                .text("The UFC got more professional it seems")
                                .fadeIn(4000, function () {
                                elem.fullpage.moveSectionDown();
                                _this.storyFinished = true;
                                elem.fullpage.setAllowScrolling(true);
                                elem.fullpage.setMouseWheelScrolling(true);
                            });
                        });
                        _this.thirdPageFinished = true;
                        return false;
                    }
                }
                if (index > nextIndex && !_this.storyFinished) {
                    return false;
                }
            },
            afterRender: function () {
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
    };
    return Startup;
}());
new Startup().fullpage();
//# sourceMappingURL=index.js.map