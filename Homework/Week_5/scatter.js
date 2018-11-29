// KOEN VAN DER KAMP 12466573

var womenInScience = "https://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS./all?startTime=2007&endTime=2015"
var gdp = "http://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(gdp)];

Promise.all(requests).then(function(response) {
    console.log(response[1])
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

    console.log(response[1])
    length = response[1].structure.dimensions.series[0].values.length
    for (i=0; i<length; i++)
    {
      data = []
      var country = response[1].structure.dimensions.series[0].values[i].name
      var object = {[country]: data}
      indexes.push(object)
    }
    console.log(countries)
    console.log(indexes)


}).catch(function(e){
    throw(e);
});
