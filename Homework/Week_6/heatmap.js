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
    var structured = d3.nest()
                      .key(function(d) { return d.Type1})
                      .key(function(d) { return d.Type2})
                      .rollup(function(d) {return d.length})
                      .entries(data);
    console.log(data)
    var data = {}
    data.key = "root"
    data.values = structured
    console.log(data)
    var partition = d3.partition()
                      .size([2 * Math.PI, RADIUS])

    var root = d3.hierarchy(data, function children(d) { return d.values; })
                            .sum(function(d) {return d.value})
                            .sort(function(a, b) { return b.value - a.value; })
    partition(root);

    var arc = d3.arc()  // <-- 2
        .startAngle(function (d) { return d.x0 })
        .endAngle(function (d) { return d.x1 })
        .innerRadius(function (d) { return d.y0 })
        .outerRadius(function (d) { return d.y1 });
    g.selectAll('path')  // <-- 1
        .data(root.descendants())  // <-- 2
        .enter()  // <-- 3
        .append('path')  // <-- 4
        .attr("display", function (d) {return d.depth ? null : "none"; })  // <-- 5
        .attr("d", arc)  // <-- 6
        .style('stroke', '#fff')  // <-- 7
        .style("fill", function(d){ return colorfunction(d) });  // <-- 8
  })
}

function colorfunction(d)
{
  colordict = {
    "Grass": "green",
    "Ground": "Sienna",
    "Fire": "OrangeRed",
    "Water": "blue",
    "Normal": "DimGray",
    "Electric": "Yellow",
    "Ice": "aqua",
    "Fighting": "DarkRed",
    "Poison": "Purple",
    "Flying": "Plum",
    "Psychic": "HotPink",
    "Bug": "YellowGreen",
    "Rock": "SaddleBrown",
    "Ghost": "RebeccaPurple",
    "Dark": "Black",
    "Dragon": "MediumVioletRed",
    "Steel": "gray",
    "Fairy": "Pink",
  }

  if (d.data.key != "undefined")
  {
    console.log(d.data.key)
    console.log(colordict[d.data.key])
    return colordict[d.data.key]
  }
  else
  {
    return "white"
  }
}
