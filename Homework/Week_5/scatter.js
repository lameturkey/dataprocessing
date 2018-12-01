// KOEN VAN DER KAMP 12466573

var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS./all?startTime=2007&endTime=2015"
var gdp = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/.B1_GE.C+HCXC/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(gdp)];

WIDTH = 1000
HEIGHT = 500

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

function updategraph()
{
  d3.select
}
function colorMaker(maxnumber)
{
  colorlist = ["#fdbb84", "#fc8d59",
"#ef6548", "#d7301f", "#b30000", "#7f0000"]
  relativenumber = maxnumber / colorlist.length
  return function(datapoint)
  {
    datapoint = datapoint - 1
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
    datatocolor = colorMaker(d3.max(Object.values(colordata)))
    var xScale = d3.scaleLinear()
                  .domain([d3.min(Object.values(xdata)), d3.max(Object.values(xdata))])
                  .range([0, WIDTH - 100])
                  .nice();
    var yScale = d3.scaleLinear()
                  .domain([0, d3.max(Object.values(ydata))])
                  .range([HEIGHT - 60, 0])
                  .nice()
    svg.append("g").call(d3.axisBottom(xScale)).attr("transform", "translate(50," + (HEIGHT - 50) + ")")
    svg.append("g").call(d3.axisLeft(yScale)).attr("transform", "translate(50,10)")
    for (i = 0; i < xdata.length; i++)
    {
      if(xdata[i] && ydata[i] && colordata[i])
      {
      svg.append("circle").attr("cx", 50 + xScale(xdata[i])).attr("cy", 10 + yScale(ydata[i]))
          .attr("r", 5).attr("fill", datatocolor(colordata[i]))
      }
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
  graph(year)
  d3.select(".slidertext").text(year)
}
