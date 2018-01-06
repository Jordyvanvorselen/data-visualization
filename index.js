var Startup = /** @class */ (function () {
    function Startup() {
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
    Startup.prototype.startStory = function (fullpageElem) {
        var _this = this;
        this.progressStory("Do you think the UFC got more exciting in the last decades?", 2000, function () {
            return _this.progressStory("Maybe it did", 500, function () {
                return _this.progressStory("Let's take a look at the amount of events and locations", 1000, function () {
                    $(".main.title.story-text")
                        .animate({
                        bottom: "75%"
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
                                        $(".arrow.down").fadeIn(2000);
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
        $(".main.title.second-page")
            .delay(1500)
            .animate({
            paddingTop: "5%"
        }, 1000, function () {
            $(".linechart")
                .animate({
                opacity: 1
            }, 1000)
                .delay(2000)
                .fadeIn(0, function () {
                fullpageElem.fullpage.setAllowScrolling(true);
                fullpageElem.fullpage.setMouseWheelScrolling(true);
                $(".arrow.down.second-page").animate({
                    opacity: 1
                }, 1000);
            });
        });
    };
    Startup.prototype.fullpage = function () {
        var _this = this;
        var elem = $("#fullpage");
        elem.fullpage({
            sectionsColor: ["#283048", "lightgray", "#283048"],
            css3: true,
            slidesNavigation: true,
            slidesNavPosition: "bottom",
            onLeave: function (index, nextIndex, direction) {
                elem.fullpage.setAllowScrolling(false);
                elem.fullpage.setMouseWheelScrolling(false);
                if (index == 1) {
                    _this.startStorySecondPage(elem);
                }
                if (index > nextIndex) {
                    return false;
                }
            },
            afterRender: function () {
                new Startup().create_ball_chart("svg.chart1", "ballchart-data.csv");
                new Startup().create_ball_chart("svg.chart2", "ballchart-data-2.csv");
                new Startup().create_ball_chart("svg.chart3", "ballchart-data-3.csv");
                new Startup().create_ball_chart("svg.chart4", "ballchart-data-4.csv");
                new Startup().createLineChart();
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