import * as d3 from 'd3';
import { DataResults, ISizeSettings, PieGraphSettings } from '../objects/data';
import { tpSchemeB } from '../objects/colors';

export function drawPieChart(chart: any, data: DataResults[], size: ISizeSettings, display: PieGraphSettings, tooltipId?: string | null): void {
    const div = d3.select(tooltipId?.toString() || "div#tooltip");

console.log(data);

if (!data || data.length != 1 || !data[0].ResultRows || data[0].ResultRows.length < 1 || data[0].Metrics.length != 1 || data[0].Dimensions.length != 1) {
  throw new RangeError("Input data in unexpected format.");
}

const width = size.width || 600;
const labelFormat = display.LabelFormat || ",";
const colors = display.WedgeColors || tpSchemeB;

const
  paddingLR = .1 * width,
  paddingTB = 40,
  radius = (width - (Math.max(paddingLR, paddingTB) * 2)) / 2,
  yAxisWidth = 65,
  xAxisWidth = 80,
  internalPadding = 35;

const height = size.height || (radius * 2) + (paddingTB * 2);


const results = data[0].ResultRows;

const totalWedges = results.length;
let total = 0;
var met = data[0].Metrics[0];
var dim = data[0].Dimensions[0];
results.forEach(x => {
  total += Number(x['MetricValues'][met["Name"]]);
})

console.log(met);
console.log(total);

const color = d3.scaleOrdinal(colors);

const dataSet = results.map(x => Number(x['MetricValues'][met["Name"]]));

console.log(dataSet);

//this.chart.selectAll("*").remove();

//let svg = this.chart.append("svg")
//  .data([results])
//  .attr("width", width)
//  .attr("height", height);

let g = chart.append("g").attr('transform', 'translate(' + (radius + paddingLR) + "," + (radius + paddingTB) + ")");




const pie = d3.pie();
  //.value(function (d any) { return Number(d['MetricValues'][met["Name"]]); })
  //.sort(null);

const arc = d3.arc()
  .innerRadius((display.InnerRadiusPercent || 0) * radius)
  .outerRadius(radius);

const arcs = g.selectAll("arc")
  .data(pie(dataSet))
  .enter()
  .append("g")
  .attr("class", "arc");

  

//if (!convertToImage && !convertToString) {
//   let div = d3.select("body").append("div")
//       .style("position", "absolute")
//       .style("text-align", "center")
//       .style("padding", ".2rem")
//       .style("border", "1px solid lightgray")
//       .style("border-radius", "4px")
//       .style("pointer-events", "none")
//       .style("background", "white")
//       .style("color", "darkgray")
//       .style("z-index", "1000");


//   var tooltip = d3.select("body")
//       .append("div")
//       .style("position", "absolute")
//       .style("z-index", "10")
//       .style("visibility", "hidden")
//       .style("background", "#000")
//       .text("a simple tooltip");


arcs.append("path")
  .attr("fill",
    function (d, i) {
      return color(i.toString());
    })
  .attr("data-content", function (d: any, i: number) {

  })
  //.attr("class", "d3-tooltip")
  .attr("d", arc).on('mouseover', function (event, d) {
    d3.select(this).transition()
      .duration(50)
      .attr('opacity', '.85');
    let num = (Math.round((Number(d.value) / total) * 100)).toString() + '%';
    div.html(num.toString() + " (" + d3.format(labelFormat)(d.value) + ")")
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 15) + "px");
    div.transition()
      .duration(50)
      .style("opacity", 1);
  })
  .on('mouseout', function (event, d) {
    d3.select(this).transition()
      .duration(50)
      .attr('opacity', '1');
    div.transition()
      .duration(50)
      .style("opacity", 0);
  });
//.on("mouseover", function (event: any, d: any) {
//    tooltip.text(d).style("left", (event.pageX + 10) + "px")
//        .style("top", (event.pageY - 15) + "px"); return tooltip.style("visibility", "visible");
//})
//.on("mouseout", function () { return tooltip.style("visibility", "hidden"); });
/* 
 * div.d3-tooltip {
position: absolute;
text-align: center;
padding: .2rem;
border: 1px solid $gray-light;
border-radius: 4px;
pointer-events: none;
background: white;
color: $gray-dark;
z-index: 1000;
}
 */
//}
//else {
//arcs.append("path")
//    .attr("fill",
//        function (d: any, i: number) {
//            return color(i.toString());
//        })
//    .attr("d", arc)
//}


//.on("mousemove", function (event: ) { return tooltip.style("top", (event.d - 10) + "px").style("left", (d3.event.pageX + 10) + "px"); })


const labels = chart.append("g").attr("transform", 'translate(' + (paddingLR) + ", " + (height - paddingTB) + ")");
for (var i = 0; i < totalWedges; i++) {
  let size = 20;
  let xStart = ((i % 3) / 3) * radius * 2;
  let yStart = Math.floor(i / 3) + 10;
  labels.append("rect")
    .attr("x", xStart)
    .attr("y", yStart)
    .attr("width", size * 2)
    .attr("height", size)
    .style("fill", color(i.toString()))

  labels.append("text")
    .attr("x", xStart + (size * 2) + 10)
    .attr("y", yStart + (size / 2))
    .text(results[i]['DimensionValues'][dim["Name"]] || "")
    .style("alignment-baseline", "middle")
    .style("text-transform", "capitalize")
    .attr("text-anchor", "start !important")
}
    //.attr("d", arc).on('mouseover', function (event, d) {
    //    d3.select(this).transition()
    //})



//if (convertToImage || convertToString) {
//    let svgText: string = chart.html();


//    // Optionally convert SVG to PNG and return it to callback as data URI
//    if (convertToImage) {
//        svg2png(Buffer.from(svgText), { width: width, height: height })
//            .then(buffer => 'data:image/png;base64,' + buffer.toString('base64'))
//            .then(buffer => {
//                callback(null, buffer);
//                return buffer;
//            });
//    }
//    // Otherwise return the HTML string
//    else if (convertToString) {
//        callback(null, svgText);
//        return svgText;
//        //return svgText;
//    }
//}
}