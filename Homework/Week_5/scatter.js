// KOEN VAN DER KAMP 12466573

var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS./all?startTime=2007&endTime=2015"
var gdp = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/.B1_GE.C+HCXC/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(gdp)];

WIDTH = 1300
HEIGHT = 500
PADDING = 50
LEGENDAPADDING = 300
COLORAMOUNT = 6

window.onload = function() {
    makegraph()
};

// produces a graph from an api respons (specifically OECD api)
function makegraph()
{

  // when all reqests forfilled
  Promise.all(requests).then(function(response)
  {
      // load data
      data = loaddata(response)

      // What data goes where
      yData = data[0]
      xData = data[1]
      colorData = data[2]

      // process and clean the data a bit (from a list of objects to a single object)
      xData = listToObject(xData)
      yData = listToObject(yData)
      colorData = listToObject(colorData)


      // all data has the same amount of keys and the same keys
      unifydata(xData, yData)
      unifydata(xData, colorData)

      // produce a function to graph all data based on the year
      graph = graphmaker(xData, yData, colorData)

      // produce a slider that can make the
      makeslider()

      // hardcode the first year
      graph(2007)
  }).catch(function(e)
    {
      throw(e);
    });
}

// loads the data from api
function loaddata(response)
{

  // consolelog when responds
  console.log(response[1])

  // hardcode the api data
  womenInSience = []
  gdp = []
  gdpCapita = []

  // for every country in the womendata
  var length = response[0].structure.dimensions.series[1].values.length
  for (i = 0; i < length; i++)
  {

    // get the data (situated in a weird array to be cleaned later)
    var data = response[0].dataSets[0].series["0:" + i].observations

    // get the country of the data
    var country = response[0].structure.dimensions.series[1].values[i].name

    // produce a new object of it
    var object = {[country]: data}

    // push the data to the list of  datapoints [{year: data}, {year: data} etc..]
    womenInSience.push(object)
  }

  // for every country in the gdp data
  length = response[1].structure.dimensions.series[0].values.length
  for (i=0; i<length; i++)
  {

    // if the data exists for total GDP and currency in Euro
    if (response[1].dataSets[0].series[i + ":0:0"] && response[1].dataSets[0].series[i + ":0:0"].attributes[1] === 2)
    {
      var country = response[1].structure.dimensions.series[0].values[i].name
      var data = response[1].dataSets[0].series[i + ":0:0"].observations
      var object = {[country]: data}
      gdp.push(object)
    }

    // if the data exists for GDP per Capita (all data is in $)
    if (response[1].dataSets[0].series[i + ":0:1"])
    {
      var country = response[1].structure.dimensions.series[0].values[i].name
      var data = response[1].dataSets[0].series[i + ":0:1"].observations
      var object = {[country]: data}
      gdpCapita.push(object)
    }
  }

  // return all data (uncleaned)
  return [womenInSience, gdpCapita, gdp]
}

// Makes a single object of the list of objects with a single key
function listToObject(list)
{
  object = {}

  // for every list entity (object)
  for (var i = 0; i < list.length; i++)
  {
    data = []

    // each object only exists as one key
    //for every datapoint in data (key:data)
    Object.values(list[i][Object.keys(list[i])[0]]).forEach(function(datapoint)
    {

      // copy the data
      data.push(datapoint[0])
    })
    object[Object.keys(list[i])[0]] = data
  }

  // return the object
  return object
}

// unifies data to eachother
function unifydata(data1, data2)
{

  // check if they key exists in the other object or not and deletes if appropiate
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

// converts the data point to the right color
function colorMaker(maxnumber)
{
  colorlist = ["#fdbb84", "#fc8d59",
"#ef6548", "#d7301f", "#b30000", "#7f0000"]
  relativenumber = maxnumber / (COLORAMOUNT - 1)
  return function(datapoint)
  {

    // return the color if an string "index" is given
    if (typeof(datapoint) === "string")
    {
      return colorlist[parseInt(datapoint)]
    }
    return colorlist[Math.floor(datapoint / relativenumber)]

  }

}

// produces graphfunction of the given data
function graphmaker(xaxisobject, yaxisobject, dotcolorobject)
{

  // save the data objects
  xobject = xaxisobject
  yobject = yaxisobject
  colorobject = dotcolorobject

  // produce basic SVG elements (graph and legenda) and titles
  svg = d3.select("body").append("svg")
            .attr("width", WIDTH)
            .attr("height", HEIGHT);
  legenda = d3.select("svg").append("g").attr("class", "legenda")
              .attr("transform", "translate(" + (WIDTH - LEGENDAPADDING + PADDING) + "," + HEIGHT/3 + ")")
  legenda.append("text").attr("class", "legendatitle")
          .attr("x", 20).attr("y", 20).text("Total gdp in euro")
  svg.append("text").attr("class", "title")
                  .attr("x", WIDTH/2).attr("y", 30)
                  .text("The influence of GDP per capita on % women researchers over time (source oecd)")
  svg.append("text").attr("class", "xlabel")
                  .attr("x", WIDTH/2).attr("y", HEIGHT - 10 )
                  .text("GDP per Capita (in USD/captia)")
  svg.append("text").attr("class", "ylabel")
                  .attr("transform", "translate(" + 15 + "," + (HEIGHT/2) + ")rotate(" + -90 + ")")
                  .text("Women in sience (% of headcount)")

  // return function that graphs on this svg
  return function(datapoint)
  {
    // convert the year to the list index
    datapoint = datapoint - 2007
    xdata = []
    ydata = []
    colordata = []

    // for every country at a specific year
    for (var key in xobject)
    {
      xdata.push(xobject[key][datapoint])
      ydata.push(yobject[key][datapoint])
      colordata.push(colorobject[key][datapoint])
    }

    //calculate the maximum value of the colors
    colordatamax = d3.max(Object.values(colordata))

    // produce a color sceme
    datatocolor = colorMaker(colordatamax)

    // produce scales
    var xScale = d3.scaleLinear()
                  .domain([d3.min(Object.values(xdata)), d3.max(Object.values(xdata))])
                  .range([PADDING, WIDTH - PADDING - LEGENDAPADDING])
                  .nice();
    var yScale = d3.scaleLinear()
                  .domain([0, d3.max(Object.values(ydata))])
                  .range([HEIGHT - PADDING, PADDING])
                  .nice()

    // print the scales
    svg.append("g").attr("class", "axis")
       .call(d3.axisBottom(xScale)).attr("transform", "translate(0," + (HEIGHT - PADDING) + ")")
    svg.append("g").attr("class", "axis")
    .call(d3.axisLeft(yScale)).attr("transform", "translate("+ PADDING + ",0)")

    // print the datapoints
    for (i = 0; i < xdata.length; i++)
    {

      // if the datapoint has all nessecary data
      if(xdata[i] && ydata[i] && colordata[i])
      {
      svg.append("circle").attr("cx", xScale(xdata[i])).attr("cy", yScale(ydata[i]))
          .attr("r", 5).attr("fill", datatocolor(colordata[i]))
      }
    }
    // calculate the binsize for the legenda labels
    binsize = colordatamax / (COLORAMOUNT)
    for (var i = 0; datatocolor(i + ""); i++)
    {
    legenda.append("rect").attr("class", "legendaboxes")
            .attr("x", 10).attr("y", 40 + 20 * i)
            .attr("width", 10).attr("height", 10)
            .attr("fill", datatocolor(i + ""))
    legenda.append("text").attr("class", "legendatext")
            .attr("x", 30).attr("y", 50 + 20 * i)
            .text(numberWithCommas(parseInt(binsize * i)))
    legenda.append("text").attr("class", "legendatext")
            .attr("x", 100).attr("y", 50 + 20 * i)
            .text("-  " +  numberWithCommas(parseInt(binsize * (i + 1)) ))
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
  d3.selectAll(".axis").remove()
  d3.selectAll(".legendatext").remove()
  d3.selectAll(".legendaboxes").remove()
  graph(year)
  d3.select(".slidertext").text(year)
}

// taken from https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
// copied the code presented in the awnser i however have no clue how this works
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
