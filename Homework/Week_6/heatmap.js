// KOEN VAN DER KAMP 12466573

// tutorial used (https://medium.com/@ttemplier/map-visualization-of-open-data-with-d3-part3-db98e8b346b3)
// used on 6/12/2018

WIDTH = 800,
HEIGHT = 800;
RADIUS = Math.min(WIDTH, HEIGHT) / 2
var color = d3.scaleOrdinal(d3.schemeCategory20b);



window.onload = function() {
  d3.json("output.json").then(function(data) {
    svg = d3.select("body").append("svg").attr("width", WIDTH).attr("height", HEIGHT)
    g = svg.append("g").attr("transform", "translate(" + WIDTH / 2 +","+ HEIGHT / 2 + ")")
    console.log(data)
    var structured = d3.nest()
                      .key(function(d) { return d.Type1})
                      .key(function(d) { return d.Type2})
                      .rollup(function(d) {return d.length})
                      .entries(data);

    var data = {}
    data.key = "root"
    data.values = structured
    console.log(data)
    var partition = d3.partition()
                      .size([2 * Math.PI, RADIUS])
    var arc = d3.arc()
                .startAngle(function(d) { return d.x0})
                .endAngle(function(d) { return d.x1})
                .innerRadius(function(d) { return d.y0})
                .outerRadius(function(d) { return d.y1});

    var root = d3.hierarchy(data).sum(function(d) {return d.size})
    var nodes = root.descendants()
    partition(root)

    var slice = g.selectAll('path').data(nodes).enter().append('path')

    slice.filter(function(d) { return d.parent; })
                .attr('d', arc)
                .style('stroke', "#fff")
                .style('fill', function(d) {
                  return "#fff"
                })
      });
  }
