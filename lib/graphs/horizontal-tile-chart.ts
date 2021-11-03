import * as d3 from 'd3';
import { DataResults, ISizeSettings, TileGraphSettings, DataResultRow } from '../objects/data';
import { tpColors } from '../objects/colors';

export function drawHorizontalTileChart(chart: any, data: DataResults[], size: ISizeSettings, display: TileGraphSettings, tooltipId?: string | null): void {

    size = size || {
      width: 600,
      height: 600,
    }
    display = display || new TileGraphSettings();

    
    chart.selectAll("*").remove();

    if (tooltipId) {
        var div = d3.select(tooltipId?.toString() || "div#tooltip");
    }
    const width = size.width || 600;
    const d3valueformat = display?.LabelFormat || ",";
    const color = display.Color || tpColors.blue;
   // const labels = this.model.values["GroupLabels"];


    if (!data || data.length != 1 || !data[0].ResultRows || data[0].ResultRows.length < 1 || data[0].Metrics.length != 1 || data[0].Dimensions.length != 2) {
      throw new RangeError("Input data in unexpected format.");
    }

    let height = size.height || 600,
      padding = 10,
      yAxisWidth = display.YAxisWidth || 90,
      xAxisWidth = 30;
    const rightMargin = 40;

    const edgePadding = 10;
    const internalPadding = display.TileSpacing || 3;

    const met = data[0].Metrics[0]["Name"];
    const dim1 = data[0].Dimensions[0]["Name"];
    const dim2 = data[0].Dimensions[1]["Name"];



    const verticalVals = Array.from(new Set(data[0].ResultRows.map(x => x.DimensionValues[dim1])));
    const horizontalVals = Array.from(new Set(data[0].ResultRows.map(x => x.DimensionValues[dim2])));
    const totalLinesVertical = Number(verticalVals.length);
    const totalLinesHorizontal = Number(horizontalVals.length);

    xAxisWidth = d3.max(horizontalVals.map(x => x.length)) * 5 || xAxisWidth;

    const tileWidth = ((width - yAxisWidth - rightMargin - ((padding + edgePadding) * 2) - (internalPadding * 2)) / (totalLinesHorizontal)) - internalPadding;
    const tileHeight = ((height - xAxisWidth - ((padding + edgePadding) * 2) - (internalPadding * 2)) / totalLinesVertical) - internalPadding;

    console.log([met, dim1, dim2].join(","))

    console.log(verticalVals);
    console.log(horizontalVals);
    console.log(data)

    const maxTotalVal = d3.max(data[0].ResultRows.map(r => {
      return Number(r["MetricValues"][met] || "0");
    })) || 10;

    console.log("Max val: " + maxTotalVal.toString());

    const opacity = d3.scaleLinear()
      .domain([0, maxTotalVal])
      .range([0, 1]);


    const x = d3.scaleLinear()
      .domain([0, totalLinesHorizontal - 1])
      .range([internalPadding + padding + edgePadding + yAxisWidth, width - padding - (internalPadding * 2) - edgePadding - tileWidth - rightMargin]);


    let lines: DataResultRow[][] = [
    ]
    verticalVals.forEach( i => {
      let l = [];
      horizontalVals.forEach(j =>  {
        l.push(data[0].ResultRows.find(x => {
          return x["DimensionValues"][dim1] == i && x["DimensionValues"][dim2] == j
        }
        ));
      })
      lines.push(l);
    })

    console.log(lines);

    const sideBarLabels = chart.append("g");

    var y = padding + edgePadding + internalPadding;
    for (var i = 0; i < lines.length; i++) {
      let currentLine = lines[i].map(x => Number(x?.MetricValues[met] || 0));

      for (var j = 0; j < currentLine.length; j++) {
        let val = currentLine[j];
        chart.append("rect")
          .attr("class", "bar " + color)
          .attr("fill", color)
          .attr("opacity", opacity(val))
          .attr("x", x(j))
          .attr("width", tileWidth)
          .attr("y", y)
          .attr("height", tileHeight)
          .on('mouseover', function (event, d) {
            d3.select(this).transition()
              .duration(50)
              .attr('opacity', 1);

            let num = d3.format(d3valueformat)(val);
            div.html(num)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 15) + "px");
            div.transition()
              .duration(50)
              .style("opacity", 1);
          })
          .on('mouseout', function () {
            d3.select(this).transition()
              .duration(50)
              .attr('opacity', opacity(val));
            div.transition()
              .duration(50)
              .style("opacity", 0);
          });
      }

      let sum = currentLine.reduce(function (a, b) {
        return a + b;
      }, 0);

      let g = sideBarLabels.append("g")
        .attr("transform", "translate(" + (width - edgePadding - rightMargin) + "," + (y + (0.5 * tileHeight)) + ")");

      g
        .append("text")
        .text(d3.format(",d")(sum))
        .style("text-anchor", "start");


      y += tileHeight + internalPadding;
    }
    var xLabels = Array.from(horizontalVals);

    var xAxis = d3.scalePoint()
      .domain(xLabels)
      .range([internalPadding + padding + edgePadding + yAxisWidth + ((tileWidth + internalPadding) / 2), width - padding - (internalPadding) - edgePadding - ((tileWidth + internalPadding) / 2) - rightMargin]);

    chart.append("g")
      .attr("transform", "translate(0, " + (height - xAxisWidth - padding - internalPadding - edgePadding) + ")")
      //.data(this.model.values["Points"])
      .call(d3.axisBottom(xAxis).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("text-anchor", "end")
      .style("text-transform", "capitalize")
      .attr("transform", "rotate(-90)");

    //chart.append("line")
    //    .style("stroke", "black")
    //    .style("stroke-width", "1")
    //    .attr("x1", yAxisWidth + padding)
    //    .attr("y1", height - xAxisWidth - padding)
    //    .attr("x2", width - padding)
    //    .attr("y2", height - xAxisWidth - padding);

    //var rightbound = width - padding - (internalPadding * 2) - edgePadding - tileWidth - rightMargin;
    //var leftbound = internalPadding + padding + edgePadding + yAxisWidth;
    //var xpos = (rightbound - leftbound) / 2 + leftbound;

    var xpos = ((width - yAxisWidth - rightMargin) / 2) + yAxisWidth

    chart.append("text")
      .attr("transform",
        "translate(" + (xpos) + ", " +
        (height - padding) + ")")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(data[0].Dimensions[1]["DisplayName"]);

    //y axis

    chart.append("text")
      .attr("transform",
        "translate(" + (padding + edgePadding) + ", " +
        (((height - (padding * 2) - xAxisWidth) / 2) + padding) + ") rotate(-90)")
      //.attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(data[0].Dimensions[0]["DisplayName"]);

    let labels = Array.from(verticalVals);
    var yStart = padding + edgePadding + internalPadding + ((tileHeight + internalPadding) / 2);
    var yAxis = d3.scalePoint()
      .domain(labels)
      .range([yStart, yStart + ((labels.length - 1) * (tileHeight + internalPadding))])

    chart.append("g")
      .attr("transform", "translate(" + (yAxisWidth + padding) + ", 0)")
      .call(d3.axisLeft(yAxis).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("text-transform", "capitalize");


  }