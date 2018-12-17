// KOEN VAN DER KAMP 12466573

// sunburst:
// tutorial used (https://medium.com/@ttemplier/map-visualization-of-open-data-with-d3-part3-db98e8b346b3)
// used on 6/12/2018

// barchart:
// https://beta.observablehq.com/@mbostock/d3-bar-chart used
// used on 12/11/2018

SUNWIDTH = 800,
SUNHEIGHT = 800;
RADIUS = Math.min(SUNWIDTH, SUNHEIGHT) / 2

BARWIDTH = 1000;
BARHEIGHT = 800;
PADDING = 30
var color = d3.scaleOrdinal(d3.schemeCategory20b);
keys =   ["HP", "Attack", "Defense", "SpDef", "SpAtk", "Speed"]

window.onload = function()
{
  d3.json("output.json").then(function(data)
  {
    loadsun(data)
    updatebar = loadbar(data)
  })
}

function loadbar(data)
{
  maxvalues = []
  for (key in keys)
  {
    maxvalues.push(Math.max.apply(null, data.map(pokemon => { return pokemon[keys[key]] })))

  }
  maxvalue = Math.max.apply(null, maxvalues)
  barsvg = d3.select("body").append("svg").attr("class", "barchart")
                    .attr("width", BARWIDTH)
                    .attr("height", BARHEIGHT)
  xScale = d3.scaleBand().domain(keys).range([PADDING, BARWIDTH]).padding(0.1)
  xAxis = barsvg.append("g").attr("transform", "translate(0, " + (BARHEIGHT - PADDING) + ")")
                            .call(d3.axisBottom(xScale));
  yScale = d3.scaleLinear().domain([0, 250]).range([BARHEIGHT - PADDING, PADDING]).nice()
  yAxis = barsvg.append("g").attr("transform", "translate("+ PADDING + ", 0)")
                            .call(d3.axisLeft(yScale));
  bartext = barsvg.append("text").attr("class", "bartext")
                  .attr("x", 100).attr("y", 0)
  barsvg.append("line").attr("class", "averageline").style("stroke", "rgb(255,0,0)")

  return function(types)
  {
    text = "Maintype: " + types.type1
    d3.selectAll(".bars").remove()
    attributes = {}
    keys.forEach(function(key)
  {
    attributes[key] = []
  })
    if (types.type2 === undefined)
    {
      data.forEach(function(datapoint)
      {
        if (datapoint.Type1 === types.type1)
        {
          for (key in datapoint)
          {
            if (keys.includes(key))
            {
              attributes[key].push(datapoint[key])
            }
          }
        }
      })
    }
    else
    {
      text += " Subtype: " + types.type2
      data.forEach(function(datapoint)
      {
        if (datapoint.Type1 === types.type1 && datapoint.Type2 === types.type2)
        {
          for (key in datapoint)
          {
            if (keys.includes(key))
            {
              attributes[key].push(datapoint[key])
            }
          }
        }
      })
    }
    for (key in attributes)
    {
      attributes[key] = average(attributes[key])
    }
    bars = barsvg.append("g").attr("class", "bars")
                 .attr("fill", "steelblue")
                 .selectAll("rect").data(Object.values(attributes)).enter().append("rect")
                 .attr("width", xScale.bandwidth())
                 .attr("x", function(d, i) { return xScale(Object.keys(attributes)[i])})
                 .attr("y", d => yScale(d))
                 .attr("height", d => yScale(0) - yScale(d))
    d3.select(".bartext").text(text)
    averagestats = average(Object.values(attributes))
    d3.select(".averageline")
                        .attr("x1", PADDING).attr("x2", BARWIDTH)
                        .attr("y1", yScale(averagestats)).attr("y2", yScale(averagestats))
  }
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
    type2 = d.data.key;
    type1 = d.parent.data.key;
  }
  else if (d.depth == 1)
  {
    type1 = d.data.key;
    type2 = undefined;
  }
  updatebar({type1: type1, type2: type2})
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

  var arc = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 })
      .outerRadius(function (d) { return d.y1 });
  g.selectAll('path')
      .data(root.descendants())
      .enter()
      .append('path')
      .attr("display", function (d) {return (d.depth && d.data.key != "undefined" ) ? null : "none"; })
      .attr("d", arc)
      .style('stroke', '#fff')
      .style("fill", function(d){ return colorfunction(d) })
      .on("mouseover", hover)
      .on("mouseleave", off)
      .on("click", click);
}

function average(array)
{
  sum = 0
  array.forEach(function(element)
  {
    sum += parseInt(element)
  })
  sum /= array.length
  return sum
}
