// KOEN VAN DER KAMP 12466573

// tutorial used (https://medium.com/@ttemplier/map-visualization-of-open-data-with-d3-part3-db98e8b346b3)
// used on 6/12/2018

WIDTH = 1200,
HEIGHT = 1000;



window.onload = function() {
  d3.json("francemap/francemap.json").then(function(data) {
    console.log(data)
  svg = d3.select("body").append("svg").attr("width", WIDTH).attr("height", HEIGHT)
    svg.append("path")
        .datum(topojson.feature(data, uk.objects.subunits))
        .attr("d", d3.geoPath().projection(d3.geoMercator()));
      });
  }
