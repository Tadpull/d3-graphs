import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { DataResults, ISizeSettings, GeoGraphSettings } from '../objects/data';
import { tpColors } from '../objects/colors';

export function drawUsaGeoChart(chart: any, data: DataResults[], size: ISizeSettings, display: GeoGraphSettings, tooltipId?: string | null): void {

    if (!data || data.length != 1 || data[0].Metrics?.length != 1 || data[0].Dimensions?.length != 3) {
      throw new Error("Data was in an incorrect format.");
    }

    chart.selectAll("*").remove();

    if (tooltipId) {
      var div = d3.select(tooltipId);
    }
    const color = display?.Color || tpColors.blue;
    const width = size?.width;
    const d3valueformat = display.LabelFormat || ",d";
    const height = size.height || width / 2.1;




    const met = data[0].Metrics[0]["Name"];
    const city = data[0].Dimensions.find(x => x["Name"] == "ga:city")["Name"];
    const lat = data[0].Dimensions.find(x => x["Name"] == "ga:latitude")["Name"];
    const lon = data[0].Dimensions.find(x => x["Name"] == "ga:longitude")["Name"];

    let mapped = data[0].ResultRows.map(x => {

      let result = {
        Value: Number(x.MetricValues[met]),
        City: x.DimensionValues[city],
        Latitude: Number(x.DimensionValues[lat]),
        Longitude: Number(x.DimensionValues[lon]),
        //ProjX: 0,
        //ProjY: 0
      };
      //let proj = projection([result["Longitude"], result["Latitude"]]);
      //result.ProjX = proj ? proj[0] : 0;
      //result.ProjY = proj ? proj[1] : 0;
      return result;
    })

    const max = d3.max(mapped.map(x => x.Value));
    const minthreshold = max * .02;
    mapped = mapped.filter(x => x.Value >= minthreshold);

    const min = d3.min(mapped.map(x => x.Value));

    const radiusminconst = 4;
    const radiusmaxconst = width / 50;
    const radiushovermultiplier = 1.4;
    const radius = d3.scaleSqrt().domain([min, max]).range([radiusminconst, radiusmaxconst])



    const margin = {
      top: 10,
      bottom: 10,
      left: 5,
      right: 5
    }

    // D3 Projection
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(width);

    const path = d3.geoPath().projection(projection);

    

    chart.append('rect')
      .attr('class', 'background center-container')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');
    //.on('click', clicked);

    const g = chart.append("g")
      .attr('class', 'center-container center-items us-state')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)

    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'/*'https://d3js.org/us-10m.v1.json'*/).then(function (us) {


      chart.append("g")
        .attr("class", "states")
        .attr("fill", "lightgray")
        .selectAll("path")
        //@ts-ignore
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path);

      chart.append("path")
        .attr("class", "state-borders")
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", "1.5px")
        .attr("stroke-linejoin", "round")
        .attr("stoke-linecap", "round")
        .attr("pointer-events", "none")
        //@ts-ignore
        .attr("d", path(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; })));


      chart.append("g").attr("class", "data-circles").selectAll("circle")
        .data(mapped)
        .enter()
        .append("circle")
        .attr("cx", /*function (d) { return d["Longitude"] })*/function (d) {
          let proj = projection([d["Longitude"], d["Latitude"]]);
          return proj ? proj[0] : -1000;
        })
        .attr("cy", /*function (d) { return d["Latitude"] })*/function (d) {
          let proj = projection([d["Longitude"], d["Latitude"]]);
          return proj ? proj[1] : -1000;
        })
        .attr("r", function (d) {
          return radius(d["Value"])/* * radiusmultipler*/;
        })
        .attr("fill", color)
        //.style("fill", dotcolor)
        .on('mouseover', function (event: any, d:any) {
          if (div) {

            d3.select(this).transition()
              .duration(50)
              .attr('r', function (d) { return radius(d["Value"]) * radiushovermultiplier; });

            let num = d3.format(d3valueformat)(d["Value"]);
            let city = d["City"] || "";
            let display = city == "" ? num : city + ": " + num.toString();
            div.html(display)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 15) + "px");
            div.transition()
              .duration(50)
              .style("opacity", 1);

          }
        })
        .on('mouseout', function (d, i) {
          if (div) {
          
          d3.select(this).transition()
            .duration(50)
            .attr('r', function (d) { return radius(d["Value"])/* * radiusmultipler*/; });
          div.transition()
            .duration(50)
            .style("opacity", 0);
        }
        });

    });
  }