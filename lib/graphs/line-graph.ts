import * as d3 from 'd3';
import { DataResults, ISizeSettings, LineGraphSettings, DataResultRow, IDataGroup } from '../objects/data';
import { tpSchemeA} from '../objects/colors';
import { GetDateLabels, MapDateDimensions } from '../functions/helpers';

export function drawLineChart(chart: any, data: DataResults[], size: ISizeSettings, display: LineGraphSettings, tooltipId?: string | null): void {
    //console.log(data);
    if (!data || data.length == 0
      || !data.every(x => { return x.ResultRows && x.ResultRows.length > 0 })
      || (data.length == 2 && data[0].Dimensions.length != 1) || (data.length == 1 && (data[0].Dimensions.length < 1 || data[0].Dimensions.length > 2))) {
      //console.log(data);
        throw new Error("Data was in an incorrect format.");
      }

    if (tooltipId) {
      var div = d3.select(tooltipId);
    }
    const d3valueformat = display?.YAxisFormat || ",";
    const colors = display.LineColors || tpSchemeA;
    const width = size?.width || 800;
    const height = size?.height || (width * 2/3);
    const rounded = display?.RoundedCorners || false;

    
      const padding = 20,
      yAxisWidth = 80,
      xAxisWidth = 80;

    const internalPadding = 35;

    var isComparison = data.length == 2;
    var vals1 = data[0].ResultRows;
    var met = data[0].Metrics[0]["Name"];
    var dim1 = data[0].Dimensions[0]["Name"];
    if (isComparison) var vals2 = data[1].ResultRows;
    else if (data[0].Dimensions.length > 1) {
      dim1 = data[0].Dimensions.find(x => x["DataType"] == "DATETIME")["Name"];
      var dim2 = data[0].Dimensions.find(x => x["Name"] != dim1)["Name"];
    }


    //const totalLines = isComparison ? 2 : dim2 ? (new Set(vals1.map(x => x.MetricValues[dim2]))).size : 1;


    var maxTotalVal = d3.max(vals1.map(x => Number(x.MetricValues[met] || 0))) || 10;
    var minTotalVal = d3.min(vals1.map(x => Number(x.MetricValues[met] || 0))) || 0;
    var lines: IDataGroup[] = [];
    let dateoutput;

    if (isComparison) {
      maxTotalVal = d3.max([maxTotalVal, d3.max(vals2.map(x => Number(x.MetricValues[met] || 0)))]) || 10
      minTotalVal = d3.min([minTotalVal, d3.min(vals2.map(x => Number(x.MetricValues[met] || 0)))]) || 0

      let dim = data[0].Dimensions[0];

      let dates1 = data[0].ResultRows.map(x => x.DimensionValues[dim1]);
      let dates2 = data[1].ResultRows.map(x => x.DimensionValues[dim1]);
      dateoutput = MapDateDimensions(dim1, dates1, dates2);

      lines.push({
        displayName: "Current Period",//data[0].Dimensions[dim2]["DisplayName"],
        name: "Current",//dim2,
        points: vals1.sort((a, b) => {
          return dateoutput.order.indexOf(dateoutput.mapping[a.DimensionValues[dim1]])
            < dateoutput.order.indexOf(dateoutput.mapping[b.DimensionValues[dim1]]) ? -1 : 1;
        }
        ).map(r => {
          return {
            y: r.MetricValues[met],
            x: r.DimensionValues[dim1]//parseDate(dim, r.DimensionValues[dim1]).toString()
          }
        })
      })

      dim = data[1].Dimensions[0];
      lines.push({
        displayName: "Previous Period",//data[1].Dimensions[dim2]["DisplayName"],
        name: "Previous",//dim2,
        points: vals2.sort((a, b) => {
          return dateoutput.order.indexOf(dateoutput.mapping[a.DimensionValues[dim1]])
            < dateoutput.order.indexOf(dateoutput.mapping[b.DimensionValues[dim1]]) ? -1 : 1;
          //parseDate(dim, a.DimensionValues[dim1]) < parseDate(dim, b.DimensionValues[dim1]) ? -1 : 1;
        }
        ).map(r => {
          return {
            y: r.MetricValues[met],
            x: r.DimensionValues[dim1]//parseDate(dim, r.DimensionValues[dim1]).toString()
          }
        })
      })

    }
    else if (data[0].Dimensions.length == 2) {
      let dimVals = Array.from(new Set(vals1.map(x => x["DimensionValues"][dim2])));
      let dates1 = data[0].ResultRows.map(x => x.DimensionValues[dim1]);
      dateoutput = MapDateDimensions(dim1, dates1);

      dimVals.forEach(d => {
        lines.push({
          displayName: d.toString(),//data[0].Dimensions[dim2]["DisplayName"],
          name: dim2,
          points: data[0].ResultRows.filter(r => r.DimensionValues[dim2] == d).sort((a, b) => {
            return dateoutput.order.indexOf(dateoutput.mapping[a.DimensionValues[dim1]])
              < dateoutput.order.indexOf(dateoutput.mapping[b.DimensionValues[dim1]]) ? -1 : 1;
          //parseDate(dim, a.DimensionValues[dim1]) < parseDate(dim, b.DimensionValues[dim1]) ? -1 : 1;
          }
          ).map(r => {
            return {
              y: r.MetricValues[met],
              x: dateoutput.mapping[r.DimensionValues[dim1]]//parseDate(dim, r.DimensionValues[dim1]).toString()
            }
          })
        })
      })
    }
    else {
      let dim = data[0].Dimensions[0];
      let dates1 = data[0].ResultRows.map(x => x.DimensionValues[dim1]);
      dateoutput = MapDateDimensions(dim1, dates1);

      lines.push({
        displayName: data[0].Metrics[0]["DisplayName"],
        name: met,
        points: data[0].ResultRows.sort((a, b) => {return dateoutput.order.indexOf(dateoutput.mapping[a.DimensionValues[dim1]])
            < dateoutput.order.indexOf(dateoutput.mapping[b.DimensionValues[dim1]]) ? -1 : 1;
          //parseDate(dim, a.DimensionValues[dim1]) < parseDate(dim, b.DimensionValues[dim1]) ? -1 : 1;
        }
        ).map(r => {
          return {
            y: r.MetricValues[met],
            x: dateoutput.mapping[r.DimensionValues[dim1]]//parseDate(dim, r.DimensionValues[dim1]).toString()
          }
        })
      });
    }
    const totalLines = lines.length;

    const color = function (ind: number): string {
      return colors[ind % colors.length];
    }
    const maxLineLength = d3.max(lines.map(x => x.points.length));
    //console.log("maxLineLength: " + maxLineLength);
    const x = d3.scaleLinear()
      .domain([0, maxLineLength - 1])
      .range([internalPadding + padding + yAxisWidth, width - padding - internalPadding]);

    const y = d3.scaleLinear()
      .domain([minTotalVal * (minTotalVal < 0 ? 1.05 : .95), maxTotalVal * 1.05])
      .range([height - padding - xAxisWidth, padding]);

    const lineFunction = display.RoundedCorners ? d3.line()
      .x(function (d, i) { return x(i); })
      .y(function (d) { return y(Number(d)); })
      .curve(d3.curveMonotoneX)
      : d3.line()
        .x(function (d, i) { return x(i); })
      .y(function (d) { return y(Number(d)); });


    console.log(lines);

    for (var i = 0; i < totalLines; i++) {
      let currentLine = lines[i].points.map(x => x.y);

      //console.log(currentLine);

      chart.append("g")
        .attr("id", "line-" + i.toString())
        .append("path").data([currentLine])
        //.attr("class", "line " + color(i) + "-line")
        .attr("stroke", color(i))
        .attr("stroke-width", 5)
        .attr("fill", "none")
        //.attr("fill", color(i))
        .attr("d", lineFunction);


      chart.select("#line-" + i.toString()).selectAll(".dot")
        .data(currentLine)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot " + color(i)) // Assign a class for styling
        .attr("fill", color(i))
        .attr("cx", function (d, i) { let _ = x(i); /*console.log(`${i}, ${_}`);*/ return x(i) })
        .attr("cy", function (d) { return y(d) })
        .attr("r", 5).on('mouseover', function (event, d) {
          if (div) {
            d3.select(this).transition()
              .duration(50)
              //.attr('opacity', '.85')
              .attr('r', 8);

            let num = d3.format(d3valueformat)(d);
            div.html(num)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 15) + "px");
            div.transition()
              .duration(50)
              .style("opacity", 1);
          }
        })
        .on('mouseout', function (event, d) {
          if (div) {
            d3.select(this).transition()
              .duration(50)
              //.attr('opacity', '1')
              .attr('r', 5);
            div.transition()
              .duration(50)
              .style("opacity", 0);
          }
          });
    

    }



    //line labels
    let linelabels: string[] = isComparison ?
      GetDateLabels(data[0].Start, data[0].End, data[1].Start, data[1].End) :
      (data[0].Dimensions.length == 2 ?
        lines.map(x => x.displayName) : []);
    const labels = chart.append("g").attr("transform", 'translate(' + (xAxisWidth + (padding * 2)) + ", " + 0 + ")");
    for (var i = 0; i < linelabels.length; i++) {
      let size = 20;
      let xStart = (((i % 4) / 4) * (width - xAxisWidth - (4 * padding)));
      let yStart = Math.floor(i / 4) + 10;
      labels.append("rect")
        .attr("x", xStart)
        .attr("y", yStart)
        .attr("width", size * 2)
        .attr("height", size)
        .style("fill", color(i))

      labels.append("text")
        .attr("x", xStart + (size * 2) + 10)
        .attr("y", yStart + (size / 2))
        .text(linelabels[i])
        .style("alignment-baseline", "middle")
        .style("text-transform", "capitalize")
        .attr("text-anchor", "start !important")
    }


    //AXES

    //x axis
    //let xValues = [];
    let xLabels: string[];
    //if (isComparison) {
    xLabels = lines[0].points.map(x => dateoutput.mapping[x.x]);
    console.log(xLabels);
    //}
    //else {

    //}
    //xLabels = Array.from(Array(maxLineLength).keys()).map(x => {
    //  return mergeLabels(lines.filter(y => y.points.length > x).map(y => y.points[x].x));
    //});

    //const xLabels = this.data.map(function (b) {
    //  xValues.push(b["Label"]);
    //  return b["Label"];
    //});
    var xValues = xLabels;
    if (xLabels.length > 60) {
      xValues = [];
      let coefficient = parseInt(String(xLabels.length / 30));
      xLabels.forEach(function (x, i) {
        if (i % coefficient == 0) { xValues.push(x); }
      });
    }

    console.log(xValues);

    const xAxis = d3.scalePoint()
      .domain(xLabels)
      .range([internalPadding + padding + yAxisWidth, width - padding - internalPadding]);

    chart.append("g")
      .attr("transform", "translate(0, " + (height - xAxisWidth - padding) + ")")
      //.data(GraphData["Points"])
      .call(d3.axisBottom(xAxis).tickValues(xValues)).selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)");

    chart.append("line")
      .style("stroke", "black")
      .style("stroke-width", "1")
      .attr("x1", yAxisWidth + padding)
      .attr("y1", height - xAxisWidth - padding)
      .attr("x2", width - padding)
      .attr("y2", height - xAxisWidth - padding);

    chart.append("text")
      .attr("transform",
        "translate(" + ((width - yAxisWidth - padding) / 2 + yAxisWidth) + ", " +
        (height - padding) + ")")
      .style("text-transform", "capitalize")
      .style("text-anchor", "middle")
      .text(data[0].Dimensions[0]["DisplayName"]);

    //y axis

    chart.append("text")
      .attr("transform",
        "translate(" + padding + ", " +
        (((height - (padding * 2) - xAxisWidth) / 2) + padding) + ") rotate(-90)")
      //.attr("transform", "rotate(-90)")
      .style("text-anchor", "end")
      .style("text-transform", "capitalize")
      .text(data[0].Metrics[0]["DisplayName"]);

    chart.append("g")
      .attr("transform", "translate(" + (yAxisWidth + padding) + ", 0)")
      .call(d3.axisLeft(y).tickFormat(function (d) { return d3.format(d3valueformat)(d); }));



  }