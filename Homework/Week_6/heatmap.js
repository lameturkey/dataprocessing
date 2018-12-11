// KOEN VAN DER KAMP 12466573

// tutorial used (https://medium.com/@ttemplier/map-visualization-of-open-data-with-d3-part3-db98e8b346b3)
// used on 6/12/2018

SUNWIDTH = 800,
SUNHEIGHT = 800;
RADIUS = Math.min(SUNWIDTH, SUNHEIGHT) / 2

BARWIDTH = 1000;
BARHEIGHT = 800;
PADDING = 30
var color = d3.scaleOrdinal(d3.schemeCategory20b);



window.onload = function()
{
  d3.json("output.json").then(function(data)
  {
    loadsun(data)
    loadbar(data)
  })
}

function loadbar(data)
{
  keys =   ["HP", "Attack", "Defense", "Sp.Def", "Speed"]
  maxvalues = []
  for (key in keys)
  {
    maxvalues.push(Math.max.apply(null, data.map(pokemon => { return pokemon[keys[key]] })))

  }
  maxvalue = Math.max.apply(null, maxvalues)
  console.log(maxvalue)
  console.log(maxvalues)

  barsvg = d3.select("body").append("svg").attr("class", "barchart")
                    .attr("width", BARWIDTH)
                    .attr("height", BARHEIGHT)
  xScale = d3.scaleBand().domain(keys).range([PADDING, BARWIDTH]).padding(0.1)
  xAxis = barsvg.append("g").attr("transform", "translate(0, " + (BARHEIGHT - PADDING) + ")")
                            .call(d3.axisBottom(xScale));
  yScale = d3.scaleLinear().domain([0, maxvalue]).range([BARHEIGHT - PADDING, 0]).nice()
  yAxis = barsvg.append("g").attr("transform", "translate("+ PADDING + ", 0)")
                            .call(d3.axisLeft(yScale));
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
    "Dragon": "LightSeaGreen ",
    "Steel": "gray",
    "Fairy": "Pink",
  }

  if (d.data.key != "undefined")
  {
    return colordict[d.data.key]
  }
  else
  {
    return "white"
  }
}
function hover(d)
{
  d3.select(this).style("fill", "black")
  d3.select(".middletext").text( d.value + " " +  d.data.key + " Pokemon")
}
function off(d)
{
  d3.select(this).style("fill", colorfunction(d))
  d3.select(".middletext").text("")
}
function click(d)
{
  if (d.depth == 2)
  {
    type2 = d.data.key
    type1 = d.parent.data.key
  }
  else (d.depth == 1)
  {
    type1 = d.data.key
    type2 = undefined
  }
  updategraph({type1: type1, type2: type2})
  return
}
function loadsun(data)
{
  svg = d3.select("body").append("svg").attr("width", SUNWIDTH).attr("height", SUNHEIGHT)
  g = svg.append("g").attr("transform", "translate(" + SUNWIDTH / 2 +","+ SUNHEIGHT / 2 + ")")
  g.append("text").attr("class", "middletext")
  var structured = d3.nest()
                    .key(function(d) { return d.Type1})
                    .key(function(d) { return d.Type2})
                    .rollup(function(d) {return d.length})
                    .entries(data);
  var data = {}
  data.key = "root"
  data.values = structured
  var partition = d3.partition()
                    .size([2 * Math.PI, RADIUS])

  var root = d3.hierarchy(data, function children(d) { return d.values; })
                          .sum(function(d) {return d.value})
                          .sort(function(a, b)
                          {
                            if (b.data.key == "undefined")
                            {
                              return -1
                            }
                            else if (a.data.key == "undefined") {
                              return 1
                            }
                            else
                            {
                              return b.value - a.value;
                            }
                          })
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
      .attr("display", function (d) {return (d.depth && d.data.key != "undefined" ) ? null : "none"; })  // <-- 5
      .attr("d", arc)  // <-- 6
      .style('stroke', '#fff')  // <-- 7
      .style("fill", function(d){ return colorfunction(d) }) // <-- 8
      .on("mouseover", hover)
      .on("mouseleave", off)
      .on("click", click);
}
