// KOEN VAN DER KAMP 12466573

var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS./all?startTime=2007&endTime=2015"
var gdp = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/.B1_GA.C/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(gdp)];

WIDTH = 1000
HEIGHT = 500

window.onload = function() {
    makegraph()
};

function loaddata(response)
{
  countries = []
  indexes = []

  var length = response[0].structure.dimensions.series[1].values.length
  for (i=0; i<length; i++)
  {
    var data = response[0].dataSets[0].series["0:" + i].observations
    var country = response[0].structure.dimensions.series[1].values[i].name
    var object = {[country]: data}
    countries.push(object)
  }

  length = response[1].structure.dimensions.series[0].values.length
  for (i=0; i<length; i++)
  {
    data = []
    var country = response[1].structure.dimensions.series[0].values[i].name
    var data = response[1].dataSets[0].series[i + ":0:0"].observations
    var object = {[country]: data}
    indexes.push(object)
  }
  return [countries, indexes]
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

function unifydata(countries, indexes)
{
  var countrykeys = Object.keys(countries)
  Object.keys(indexes).forEach(function(key)
    {
      if (!(countrykeys.includes(key)))
      {
        delete indexes[key];
      }
    })
  Object.keys(countries).forEach(function(key)
    {
      if (!(Object.keys(indexes).includes(key)))
      {
        delete countries[key]
      }
    })

}

function makegraph()
{
  Promise.all(requests).then(function(response)
  {
      data = loaddata(response)
      countries = data[0]
      indexes = data[1]

      // produce objects from list of objects
      countries = listToObject(countries)
      indexes = listToObject(indexes)
      unifydata(countries, indexes)
      console.log(countries)
      console.log(indexes)
      //graphskeleton(indexes, countries)
  }).catch(function(e)
    {
      throw(e);
    });
}

function graphskeleton(xobject, yobject)
{
  var xScale = d3.scaleLinear()
                .domain([d3.min(Object.values(xobject)), d3.max(Object.values(xobject))])
  console.log(d3.min(Object.values(xobject)))
  var yScale = d3.scaleLinear()
                .domain([d3.min[Object.values(yobject)], d3.min[Object.values(yobject)]])

  svg = d3.select("body").append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT)
            .append("g")
            .call(d3.axisBottom(xScale))
}
