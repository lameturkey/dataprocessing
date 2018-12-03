// KOEN VAN DER KAMP 12466573

var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS./all?startTime=2007&endTime=2015"
var gdp = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/.B1_GE.C+HCXC/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(gdp)];

WIDTH = 1000
HEIGHT = 500
PADDING = 50
COLORAMOUNT = 6

window.onload = function() {
    makegraph()
};

function loaddata(response)
{
  console.log(response[1])
  womenInSience = []
  gdp = []
  gdpCapita = []
  var length = response[0].structure.dimensions.series[1].values.length
  for (i=0; i<length; i++)
  {
    var data = response[0].dataSets[0].series["0:" + i].observations
    var country = response[0].structure.dimensions.series[1].values[i].name
    var object = {[country]: data}
    womenInSience.push(object)
  }

  length = response[1].structure.dimensions.series[0].values.length
  for (i=0; i<length; i++)
  {
    data = []
    if (response[1].dataSets[0].series[i + ":0:0"] && response[1].dataSets[0].series[i + ":0:0"].attributes[1] === 2)
    {
      var country = response[1].structure.dimensions.series[0].values[i].name
      var data = response[1].dataSets[0].series[i + ":0:0"].observations
      var object = {[country]: data}
      gdp.push(object)
    }
    if (response[1].dataSets[0].series[i + ":0:1"] && response[1].dataSets[0].series[i + ":0:1"].attributes[1] === 1)
    {
      var country = response[1].structure.dimensions.series[0].values[i].name
      var data = response[1].dataSets[0].series[i + ":0:1"].observations
      var object = {[country]: data}
      gdpCapita.push(object)
    }
  }
  return [womenInSience, gdpCapita, gdp]
}
function listToObject(list)
{
  object = {}
  for (var i = 0; i < list.length; i++)
  {
    data = []
    Object.values(list[i][Object.keys(list[i])[0]]).forEach(function(datapoint)
    {
      data.push(datapoint[0])
    })
    object[Object.keys(list[i])[0]] = data
  }
  return object
}

function unifydata(data1, data2)
{
  var countrykeys = Object.keys(data1)
  Object.keys(data2).forEach(function(key)
    {
      if (!(countrykeys.includes(key)))
      {
        delete data2[key];
      }
    })
  Object.keys(data1).forEach(function(key)
    {
      if (!(Object.keys(data2).includes(key)))
      {
        delete data1[key]
      }
    })

}

function makegraph()
{
  Promise.all(requests).then(function(response)
  {
      data = loaddata(response)
      yData = data[0]
      xData = data[1]
      colorData = data[2]
      // produce objects from list of objects
      xData = listToObject(xData)
      yData = listToObject(yData)
      colorData = listToObject(colorData)
      // all data has the same countries
      unifydata(xData, yData)
      unifydata(xData, colorData)
      graph = graphmaker(xData, yData, colorData)
      makeslider()
      graph(2007)
  }).catch(function(e)
    {
      throw(e);
    });
}

function colorMaker(maxnumber)
{
  colorlist = ["#fdbb84", "#fc8d59",
"#ef6548", "#d7301f", "#b30000", "#7f0000"]
  relativenumber = maxnumber / (COLORAMOUNT - 1)
  return function(datapoint)
  {
    if (typeof(datapoint) === "string")
    {
      return colorlist[parseInt(datapoint)]
    }
    return colorlist[Math.floor(datapoint / relativenumber)]

  }

}
function graphmaker(xaxisobject, yaxisobject, dotcolorobject)
{
  xobject = xaxisobject
  yobject = yaxisobject
  colorobject = dotcolorobject
  svg = d3.select("body").append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT);
  legenda = d3.select("body").append("svg").attr("class", "legenda");
  legenda.append("text").attr("class", "legendatitle")
          .attr("x", 20).attr("y", 20).text("Total gdp in $")
  svg.append("text").attr("class", "title")
                  .attr("x", WIDTH/2).attr("y", 30)
                  .text("The influence of GDP per capita on % women researchers over time")
  svg.append("text").attr("class", "xlabel")
                  .attr("x", WIDTH/2).attr("y", HEIGHT - 10 )
                  .text("GDP per Capita (in euro/captia)")
  svg.append("text").attr("class", "ylabel")
                  .attr("transform", "translate(" + 15 + "," + (HEIGHT/2) + ")rotate(" + -90 + ")")
                  .text("Women in sience (% of headcount)")
  return function(datapoint)
  {
    datapoint = datapoint - 2007
    xdata = []
    ydata = []
    colordata = []
    for (var key in xobject)
    {
      xdata.push(xobject[key][datapoint])
      ydata.push(yobject[key][datapoint])
      colordata.push(colorobject[key][datapoint])
    }
    colordatamax = d3.max(Object.values(colordata))
    datatocolor = colorMaker(colordatamax)
    var xScale = d3.scaleLinear()
                  .domain([d3.min(Object.values(xdata)), d3.max(Object.values(xdata))])
                  .range([PADDING, WIDTH - 100])
                  .nice();
    var yScale = d3.scaleLinear()
                  .domain([0, d3.max(Object.values(ydata))])
                  .range([HEIGHT - PADDING, PADDING])
                  .nice()
    svg.append("g").call(d3.axisBottom(xScale)).attr("transform", "translate(0," + (HEIGHT - PADDING) + ")")
    svg.append("g").call(d3.axisLeft(yScale)).attr("transform", "translate("+ PADDING + ",0)")
    for (i = 0; i < xdata.length; i++)
    {
      if(xdata[i] && ydata[i] && colordata[i])
      {
      svg.append("circle").attr("cx", xScale(xdata[i])).attr("cy", yScale(ydata[i]))
          .attr("r", 5).attr("fill", datatocolor(colordata[i]))
      }
    }

    binsize = colordatamax / (COLORAMOUNT - 1)
    for (var i = 0; datatocolor(i + ""); i++)
    {
    console.log(datatocolor(i +  ""))
    legenda.append("rect").attr("class", "legendaboxes")
            .attr("x", 10).attr("y", 40 + 20 * i)
            .attr("width", 10).attr("height", 10)
            .attr("fill", datatocolor(i + ""))
    legenda.append("text").attr("class", "legendatext")
            .attr("x", 30).attr("y", 50 + 20 * i)
            .text(parseInt(binsize * i))
    legenda.append("text").attr("class", "legendatext")
            .attr("x", 100).attr("y", 50 + 20 * i)
            .text("-  " +  Math.round(parseInt(binsize * (i + 1)) ))
    }
  }
}

function makeslider()
{
  d3.select("body").append("div").attr("class", "sliderdiv")
  d3.select(".sliderdiv").append("text").attr("class", "slidertext")
            .text("2005")
  d3.select(".sliderdiv").append("input").attr("type", "range").attr("class", "slider")
    .attr("min", 2007).attr("max", 2015).attr("step", 1).attr("value", 2007)
    .attr("onchange", "updategraph(this.value)")
}

function updategraph(year)
{
  d3.selectAll("circle").remove()
  d3.selectAll("g").remove()
  d3.selectAll(".legendatext").remove()
  d3.selectAll(".legendaboxes").remove()
  graph(year)
  d3.select(".slidertext").text(year)
}
