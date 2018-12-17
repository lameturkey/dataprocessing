// KOEN VAN DER KAMP 12466573

// sunburst:
// tutorial used (https://medium.com/@ttemplier/map-visualization-of-open-data-with-d3-part3-db98e8b346b3)
// used on 6/12/2018

// barchart:
// https://beta.observablehq.com/@mbostock/d3-bar-chart used
// used on 12/11/2018

// Graph constants
SUNWIDTH = 800,
SUNHEIGHT = 800;
RADIUS = Math.min(SUNWIDTH, SUNHEIGHT) / 2

BARWIDTH = 1000;
BARHEIGHT = 800;
PADDING = 30

// Barchart x axis keys
keys =   ["HP", "Attack", "Defense", "SpDef", "SpAtk", "Speed"]

// "Main function"
window.onload = function()
{

  // get the data
  d3.json("output.json").then(function(data)
  {
    // Load and update function creation
    loadsun(data)
    updatebar = loadbar(data)
  })
}

// loads the sunburst
function loadsun(data)
{

  // produce an svg and a 'g' centered in the middle
  svg = d3.select("body").append("svg").attr("width", SUNWIDTH).attr("height", SUNHEIGHT)
  g = svg.append("g").attr("transform", "translate(" + SUNWIDTH / 2 +","+ SUNHEIGHT / 2 + ")")
  g.append("text").attr("class", "middletext")

  // produce nested data for the sunburst from the original data
  var structured = d3.nest()
                    .key(function(d) { return d.Type1})
                    .key(function(d) { return d.Type2})
                    .rollup(function(d) {return d.length})
                    .entries(data);

  // produce a root node
  var data = {}
  data.key = "root"
  data.values = structured

  // produce a partition
  var partition = d3.partition()
                    .size([2 * Math.PI, RADIUS])

  // make a hierarchy of the structured data
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

  // then devide it into partitions
  partition(root);

  // arc making function that uses these partitions
  var arc = d3.arc()
      .startAngle(function (d) { return d.x0 })
      .endAngle(function (d) { return d.x1 })
      .innerRadius(function (d) { return d.y0 })
      .outerRadius(function (d) { return d.y1 });

  // produce all the arcs
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


// Loads the bar graph
function loadbar(data)
{

  // make an svg for the chart
  barsvg = d3.select("body").append("svg").attr("class", "barchart")
                    .attr("width", BARWIDTH)
                    .attr("height", BARHEIGHT)

  // Produce the axis (yscale domain is hardcoded for readability)
  xScale = d3.scaleBand().domain(keys).range([PADDING, BARWIDTH]).padding(0.1)
  xAxis = barsvg.append("g").attr("transform", "translate(0, " + (BARHEIGHT - PADDING) + ")")
                            .call(d3.axisBottom(xScale));
  yScale = d3.scaleLinear().domain([0, 160]).range([BARHEIGHT - PADDING, PADDING]).nice()
  yAxis = barsvg.append("g").attr("transform", "translate("+ PADDING + ", 0)")
                            .call(d3.axisLeft(yScale));

  // Make the text to show what catagory is currently active
  bartext = barsvg.append("text").attr("class", "bartext")
                  .attr("x", 100).attr("y", 50)

  // make the averageline
  barsvg.append("line").attr("class", "averageline").style("stroke", "rgb(255,0,0)")

  // make placeholder bars
  bars = barsvg.append("g").attr("class", "bars")
               .selectAll("rect").data(keys).enter().append("rect")

  // and placeholder tooltip
  bars.append("title")

  // returns a function where you can update this graph
  // accept an object in the form of {type1: "string", type2: "string"}
  return function(types)
  {
    text = "Maintype: " + types.type1

    // make an object to store all stats
    attributes = {}
    keys.forEach(function(key)
    {
      attributes[key] = []
    })

    // gets all the nessecary stats from the data stores them in the right location
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
      text += " and Subtype: " + types.type2
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

    // average all the stats
    for (key in attributes)
    {
      attributes[key] = average(attributes[key])
    }

    // update the graph bars
    bars.data(Object.values(attributes)).transition().duration(1000)
                 .attr("width", xScale.bandwidth())
                 .attr("x", function(d, i) { return xScale(Object.keys(attributes)[i])})
                 .attr("y", d => yScale(d))
                 .attr("height", d => yScale(0) - yScale(d))
                 .attr("fill", colorfunction(types.type1))
                 .select("title").text(d => d)

    // update the text
    d3.select(".bartext").text(text)

    // update the averageline
    averagestats = average(Object.values(attributes))
    d3.select(".averageline")
                        .attr("x1", PADDING).attr("x2", BARWIDTH)
                        .attr("y1", yScale(averagestats)).attr("y2", yScale(averagestats))
  }
}

// imput is a string of type or a node where the type can be obtained from
// returns the color of the bar or sunburst part according to type
function colorfunction(d)
{

    // hardcode all types to a single color
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

  // if imput is string return the corresponding color
  if (typeof(d) == "string")
  {
    return colordict[d]
  }

  // or find the color within the node (or parent node)
  if (d.data.key != "undefined")
  {
    return colordict[d.data.key]
  }
  else
  {
    return "white"
  }
}

// onhover of the sunburst change the middletext and color
function hover(d)
{
  d3.select(this).style("fill", "black")
  d3.select(".middletext").text( d.value + " " +  d.data.key + " Pokemon")
}

// offhover of the sunburst return to normal
function off(d)
{
  d3.select(this).style("fill", colorfunction(d))
  d3.select(".middletext").text("")
}

// onclick of the sunburst returns the types corresponding to that part
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

// returns an average of the imput array
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
