import * as d3 from 'd3';
import { DataResults, ISizeSettings, GroupedBarGraphSettings } from '../objects/data';
import { tpColors } from '../objects/colors';
import { dateMerge, GetDateLabels } from '../functions/helpers';
export function drawGroupedBarChart(chart: any, data: DataResults[], size: ISizeSettings, display: GroupedBarGraphSettings, tooltipId?: string | null): void {
    if(data?.length != 2 || !(data[0].ResultRows?.length > 0 && data[1].ResultRows?.length > 0) || data[0].Dimensions.length != 1 || data[0].Metrics.length != 1){
        throw new Error("Data was in an unexpected format.");
    }


    chart.selectAll("*").remove();

    if (tooltipId) {
      var div = d3.select(tooltipId);
    }

    size = size || {
      width: 700,
    }

    display = display || new GroupedBarGraphSettings();

    const colors = display?.Colors || [tpColors.greenDark, tpColors.blue];
    let width = size?.width || 700;
    const d3valueformat = display.LabelFormat || ",d";
    const barWidthPercent = display?.BarThicknessPercent || 0.5;

    var met = data[0].Metrics[0]["Name"];
    var dim = data[0].Dimensions[0]["Name"];
    let dim0set = Array.from(new Set(data[0].ResultRows.map(x => x.DimensionValues[dim])));
    let dim1set = Array.from(new Set(data[1].ResultRows.map(x => x.DimensionValues[dim])));
    let combined = Array.from(new Set([...dim0set, ...dim1set]));
    let bars = combined.map(dimval => {
        let val0 = data[0].ResultRows.find(x => x.DimensionValues[dim] == dimval).MetricValues[met];
        let val1 = data[1].ResultRows.find(x => x.DimensionValues[dim] == dimval).MetricValues[met];
        return {
            DimVal: dimval,
            MetVal0: val0,
            MetVal1: val1
        };
    });

    //graph orientation, vertical or horizontal bars
    const vert = display?.Vertical || false;

    const topMargin = 40,
    domainPadding = 1.05,
    padding = 20,
    xAxisWidth = 80,
    yAxisWidth = 80;
    let innerWidth = width - (padding * 2) - yAxisWidth;
    let blockWidth = vert ? innerWidth / bars.length : display?.BlockWidth || 60;
    let barWidth = blockWidth * (1 / 2) * barWidthPercent;
    let gapWidth = blockWidth * (1 / 3) * (1 - barWidthPercent); 

    let height = size?.height || vert ? 400 : topMargin + (padding * 2) + xAxisWidth + (bars.length * blockWidth);
    let innerHeight = height - topMargin - (padding * 2) - xAxisWidth;

    let max = d3.max(bars.map(x => d3.max([Number(x.MetVal0), Number(x.MetVal1)])));
   


    let barLength = d3.scaleLinear()
    .domain([0, max * domainPadding])
    .range(vert ? [0, innerHeight] : [0, innerWidth]);

    let barStart = d3.scaleLinear()
    .domain([0, bars.length - 1])
    .range(vert ? [gapWidth + padding + yAxisWidth, width - padding - (blockWidth - gapWidth)]
     : [gapWidth + padding + topMargin, height - (xAxisWidth + padding + (blockWidth - gapWidth))])


     console.log(bars);
    let color = d3.scaleOrdinal(colors);

     const body = chart.append("g");

     //add labels first
     let labels = GetDateLabels(data[0].Start, data[0].End, data[1].Start, data[1].End);
     const labelement = chart.append("g").attr('transform', `translate(${yAxisWidth + padding}, ${padding})`);
     
     for(let i = 0; i < labels.length; i++){
         let size = 20;
         let labelstart = i * (size * 5 + 10)
        labelement.append("rect")
        .attr("x", labelstart)
        .attr("y", 0)
        .attr("width", size * 2)
        .attr("height", size)
        .style("fill", color(i.toString()))

        labelement.append('text')
        .attr("x", labelstart + (size * 2) + 10)
        .attr("y", size / 2)
        .text(labels[i])
        .style("alignment-baseline", "middle")
        .style("text-transform", "capitalize")
        .attr("text-anchor", "start !important");
     }

     for(let i = 0; i < bars.length; i++){

        //calculate length and start coordinates for both bars
        let val0 = bars[i].MetVal0;
        let val1 = bars[i].MetVal1;
        let l0 = barLength(val0); 
        let l1 = barLength(val1);
        let s0 = barStart(i);
        let s1 = s0 + gapWidth + barWidth;

        //cur val
        body.append("rect")
        .attr("fill", color("0"))
        .attr("x", vert ?  s0 : yAxisWidth + padding)
        .attr("width", vert ? barWidth : l0)
        .attr("y", vert ? height - padding - xAxisWidth - l0 : s0)
        .attr("height", vert ? l0 : barWidth)
        .on('mouseover', function (event, d) {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', 0.8);
  
              let num = d3.format(d3valueformat)(val0);
              div.html(num)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
              div.transition()
                .duration(50)
                .style("opacity", 1);
            }
          })
          .on('mouseout', function () {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', 1);
              div.transition()
                .duration(50)
                .style("opacity", 0);
            }
          });

          //prev val
          body.append("rect")
        .attr("fill", color("1"))
        .attr("x", vert ?  s1 : yAxisWidth + padding)
        .attr("width", vert ? barWidth : l1)
        .attr("y", vert ? height - padding - xAxisWidth - l1 : s1)
        .attr("height", vert ? l1 : barWidth)
        .on('mouseover', function (event, d) {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', 0.8);
  
              let num = d3.format(d3valueformat)(val1);
              div.html(num)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
              div.transition()
                .duration(50)
                .style("opacity", 1);
            }
          })
          .on('mouseout', function () {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', 1);
              div.transition()
                .duration(50)
                .style("opacity", 0);
            }
          });
        
     }


     const yAxis =
     d3.scalePoint()
     .domain(bars.map(x => x.DimVal))
     .range(vert ? [yAxisWidth + padding + (gapWidth * 1.5) + barWidth, width - padding - ((gapWidth * 1.5) + barWidth)]
      : [topMargin + padding + (gapWidth * 1.5) + barWidth, height - padding - xAxisWidth - ((gapWidth * 1.5) + barWidth)]);

     chart.append("g")
     .attr("transform", vert ? `translate(0, ${height - xAxisWidth - padding})` : `translate(${yAxisWidth + padding}, 0)`)
     .call(vert ? d3.axisBottom(yAxis) : d3.axisLeft(yAxis)).selectAll("text")
     .style("text-transform", "capitalize")
     .style("text-anchor", "end");

     chart.append("line")
     .style("stroke", "black")
     .style("stroke-width", "1")
     .attr("x1", yAxisWidth + padding)
     .attr("y1", height - xAxisWidth - padding)
     .attr("x2", vert ? width - padding : yAxisWidth + padding)
     .attr("y2", vert ? height - xAxisWidth - padding : topMargin + padding)
     
     chart.append('text')
     .attr('transform', ` translate(${vert ? yAxisWidth + padding + (innerWidth / 2): padding }, ${vert ? height - padding : topMargin + padding + (innerHeight / 2)}) rotate(${vert ? 0 : -90})`)
   .style("text-anchor", "middle")
   .style("text-transform", "capitalize")
   .text(data[0].Dimensions[0]["DisplayName"]);

     //x axis

     var invertedBarLength = d3.scaleLinear()
     .domain([0, max * domainPadding])
     .range(vert ? [innerHeight, 0] : [0, innerWidth]);

     chart.append("g")
     .attr("transform", vert ? `translate(${yAxisWidth + padding}, ${topMargin + padding})` 
     : `translate(${padding + yAxisWidth}, ${height - xAxisWidth - padding})`)
     .call(vert ? 
        d3.axisLeft(invertedBarLength).tickFormat(function (d) {return d3.format(d3valueformat)(d) }) : 
        d3.axisBottom(invertedBarLength).tickFormat(function (d) {return d3.format(d3valueformat)(d) })
        )

        chart.append('text')
        .attr('transform', ` translate(${vert ? padding : yAxisWidth + padding + (innerWidth / 2)}, ${vert ? topMargin + padding + (innerHeight / 2) : height - padding}) rotate(${vert ? -90 : 0})`)
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(data[0].Metrics[0]["DisplayName"]);


}