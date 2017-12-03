class Startup {

    public create_ball_chart(svgSelector: string, dataPath: string): void {        
        var svg = d3.select(svgSelector),
        width = +svg.attr("width"),
        height = +svg.attr("height");
        
        var format = d3.format(",d");
        
        var color = d3.scaleOrdinal(d3.schemeCategory20c);
        
        var pack = d3.pack()
            .size([width, height])
            .padding(1.5);
        
        d3.csv(dataPath, function(d: any) {
          d.value = +d.value;
          if (d.value) return d;
        }, function(error, classes) {
          if (error) throw error;
        
          var root = d3.hierarchy({children: classes})
              .sum(function(d: any) { return d.value; })
              .each(function(d: any) {
                if (id = d.data.id) {
                  var id, i = id.lastIndexOf(".");
                  d.id = id;
                  d.package = id.slice(0, i);
                  d.class = id.slice(i + 1);
                }
              });
        
          var node = svg.selectAll(".node")
            .data(pack(root).leaves())
            .enter().append("g")
              .attr("class", "node")
              .attr("transform", function(d: any) { return "translate(" + d.x + "," + d.y + ")"; });
        
          node.append("circle")
              .attr("id", function(d: any) { return d.id; })
              .attr("r", function(d: any) { return d.r; })
              .style("fill", function(d: any) { return color(d.package); });
        
          node.append("clipPath")
              .attr("id", function(d) { return "clip-" + d.id; })
            .append("use")
              .attr("xlink:href", function(d) { return "#" + d.id; });
        
          node.append("text")
              .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
            .selectAll("tspan")
            .data(function(d: any) { return d.class.split(/(?=[A-Z][^A-Z])/g); })
            .enter().append("tspan")
              .attr("x", 0)
              .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
              .text(function(d: any) { return d; });

          node.append("title")
              .text(function(d) { return d.id + "\n" + format(d.value); });

          d3.selectAll('circle').attr('class', 'fade');
        });

    }

    public fullpage(): void {
        var elem: any = $('#fullpage');
        elem.fullpage({
            sectionsColor: ['#283048', 'lightgray', '#283048'],
            css3: true,
            anchors:['firstPage', 'secondPage', 'thirdPage'],
            slidesNavigation: true,
            slidesNavPosition: 'bottom',
            afterRender: () => {
                new Startup().create_ball_chart('svg.chart1', 'ballchart-data.csv')
                new Startup().create_ball_chart('svg.chart2', 'ballchart-data-2.csv')
                new Startup().create_ball_chart('svg.chart3', 'ballchart-data-3.csv')
                new Startup().create_ball_chart('svg.chart4', 'ballchart-data-4.csv')
            }
        });
    }
}

new Startup().fullpage();
