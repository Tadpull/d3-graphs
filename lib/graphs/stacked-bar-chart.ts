import * as d3 from 'd3';
import { DataResults, ISizeSettings, StackedBarGraphSettings } from '../objects/data';
import { tpColors } from '../objects/colors';
import { parseDate } from '../functions/helpers';


export function drawStackedBarChart(chart: any, data: DataResults[], size: ISizeSettings, display: StackedBarGraphSettings, tooltipId?: string | null): void {
console.log(size);
console.log(data);


    size = size || {}
    display = display || new StackedBarGraphSettings();

    if (!data || data.length != 1 || data[0].Metrics?.length != 1 || data[0].Dimensions?.length != 2) {
      throw new Error("Data was in an incorrect format.");
    }

    chart.selectAll("*").remove();

    if (tooltipId) {
        var div = d3.select(tooltipId?.toString() || "div#tooltip");
    }
    const colors = display?.Colors || [tpColors.greenDark, tpColors.pink];
    const width = size.width;
    const hor = display?.Horizontal;
    const d3valueformat = display.LabelFormat || ",d";
    const sortByLargest = true;

    let met = data[0].Metrics[0]["Name"];
    let dim1 = data[0].Dimensions[0]["Name"];
    let dim2 = data[0].Dimensions[1]["Name"];


    if (data[0].Dimensions[1]["DataType"] == "DATETIME") { // just make dim1 the date dimension
      let swap = dim2;
      dim2 = dim1;
      dim1 = swap;
    }

    let isdate = data[0].Dimensions[0]["DataType"] == "DATETIME" || data[0].Dimensions[1]["DataType"] == "DATETIME";

    const dim1set = Array.from(new Set(data[0].ResultRows.map(x => {
      return x.DimensionValues[dim1];
    })));
    const dim2set = Array.from(new Set(data[0].ResultRows.map(x => {
      return x.DimensionValues[dim2];
    })));



    console.log(dim1set);
    var bars: {
      DimName: string;
      Values: { Dim: string, Val: number }[];
    }[] = [];
    for (let i = 0; i < dim1set.length; i++) {
        let rows = data[0].ResultRows.filter(x => x.DimensionValues[dim1] == dim1set[i]);
      bars.push({
        DimName: dim1set[i],
        Values: rows.map(x => {
        return {
          Dim: x.DimensionValues[dim2],
          Val: Number(x.MetricValues[met])
        };})
      });
    }
    
    //console.log(bars);

    if(sortByLargest) {
      bars.sort((first, second) => { 
        let sum1 = 0;
        let sum2 = 0;
        first?.Values?.forEach(x => sum1 += x.Val);
        second?.Values?.forEach(x => sum2 += x.Val);
        return sum1 > sum2 ? -1 : 1;
      })
      
    }

    console.log(bars);

    const numberOfBars = bars.length;
    const height = size?.height || (hor ? numberOfBars * 60 : width / 2);
    //Total Value for each bar
    const totalBar = bars.map(function (d) {
      return d3.sum(d.Values.map(x => x.Val));
    });
    //max value for all bars
    const maxTotalVal = d3.max(totalBar) || 10;

    const yAxisPadding = 120;
    const xAxisPadding = 120;
    const barWidthPercent = 0.6;
    const paddingPercent = 0.4;
    const padding = 20;
    const topMargin = 50;
    const barWidth = hor ? 
    ((height - (padding * 2) - xAxisPadding) / numberOfBars) * barWidthPercent :
    ((width - (padding * 2) - yAxisPadding) / numberOfBars) * barWidthPercent;
    const gapWidth = hor ? 
    ((height - xAxisPadding) / numberOfBars) * (paddingPercent / 2) : 
    ((width - yAxisPadding) / numberOfBars) * (paddingPercent / 2);
    const domainPadding = 1.05;

    const x0 = d3.scaleLinear()
      .domain([0, numberOfBars - 1])
      .range(hor ? [topMargin + gapWidth, height - xAxisPadding - (gapWidth + barWidth)] : [yAxisPadding + gapWidth, width - (gapWidth + barWidth)]);

    const color = function (ind: number):string {
      return colors[ind % colors.length];
    }

    const barHeight = 
    d3.scaleLinear()
      .domain([0, Number(maxTotalVal) * domainPadding]) //*domainPadding in order to have some top padding for total bar value
      .range(hor ? [0, width - yAxisPadding - (2 * padding)] : [0, height - xAxisPadding - (2 * padding) - topMargin])

    const barsContainer = chart.append("g");

    const topBarLabels = chart.append("g");


    //ALL BARS
    for (let i = 0; i < numberOfBars; i++) {
      let barStartingPoint = hor ? yAxisPadding : height - xAxisPadding;
      let g: any;
      
      if(!hor) {
      g = topBarLabels.append("g")
        .attr("transform",
        "translate(" + (x0(i) + (barWidth / 2)) + ", " + (height - barHeight(totalBar[i]) - xAxisPadding - 2) + ")")

        .style("opacity", 0);
      g
        .append("text")
        .text(d3.format(d3valueformat)(totalBar[i]))
        .style("text-anchor", "middle");
      }


      for (let j = 0; j < bars[i].Values.length; j++) {
        let val = bars[i].Values[j].Val;
        let barTotal = totalBar[i];
        var barH = barHeight(val);
        if(!hor) barStartingPoint = barStartingPoint - barH;
        barsContainer
          .append("rect")
          //.attr("class", "bar " + dim2set.indexOf(bars[i][j].Dim))
          .attr("fill", color(dim2set.indexOf(bars[i].Values[j].Dim)))
          .attr("x", hor ? barStartingPoint : x0(i))
          .attr("width", hor ? barH : barWidth)
          .attr("y", hor ? x0(i) : barStartingPoint)
          .attr("height", hor ? barWidth : barH)
          .on('mouseover', function (event, d) {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', '.85');

              let num = (d3.format(d3valueformat)(val)).toString();
              let perc = (d3.format(",d")((val / barTotal) * 100)).toString() + "%";

              div.html(num + " (" + perc + ")")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 15) + "px");
              div.transition()
                .duration(50)
                .style("opacity", 1);
              g.transition()
                .duration(50)
                .style("opacity", 1);
            }
          })
          .on('mouseout', function () {
            if (div) {
              d3.select(this).transition()
                .duration(50)
                .attr('opacity', '1');
              div.transition()
                .duration(50)
                .style("opacity", 0);

              g.transition()
                .duration(50).style("opacity", 0);
            }
          });
          if(hor) barStartingPoint += barH;
      }
      if(hor) {
        g = topBarLabels.append("g")
        .attr("transform", `translate(${barStartingPoint + 15}, ${x0(i) + (barWidth / 2)})` )
        .style("opacity", 0);
        g.append("text")
        .text(d3.format(d3valueformat)(totalBar[i]))
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-90)");
      }


    }

    topBarLabels.raise();

    //Chart Labels
    var divisor = Math.floor(width / 150) ?? 1;
    const labels = chart.append("g")
      .attr("transform", "translate(" + yAxisPadding +  ", " + padding + ")")
    for (let i = 0; i < dim2set.length; i++) {
      let size = 20;
      let xStart = ((i % divisor) / divisor) * (width - yAxisPadding);
      let yStart = Math.floor(i / divisor) + 10;
      labels.append("rect")
        .attr("x", xStart)
        .attr("y", yStart)
        .attr("width", size * 2)
        .attr("height", size)
        .style("fill", color(i))

      labels.append("text")
        .attr("x", xStart + (size * 2) + 10)
        .attr("y", yStart + (size / 2))
        .style("text-transform", "capitalize")
        .text(dim2set[i] || "")
        .style("alignment-baseline", "middle")
        .attr("text-anchor", "left")
        if(hor) {
          chart.append("line")
          .style("stroke", "black")
          .style("stroke-width", "1")
          .attr("x1", yAxisPadding)
          .attr("y1", topMargin + gapWidth)
          .attr("x2", yAxisPadding)
          .attr("y2", height - xAxisPadding)
        }
    }

    //AXES

    //x axis
    let xLabels: any[] = (isdate && !sortByLargest) ? dim1set.map(x => {
      parseDate(data[0].Dimensions.find(x => x["DataType"] == "DATETIME"), x);
    }) : bars?.map(x => x.DimName);

    const xAxis = d3.scalePoint()
      .domain(xLabels)
      .range(hor ? [gapWidth + (0.5 * barWidth) + topMargin, (height - xAxisPadding) - gapWidth - (0.5 * barWidth)] : [gapWidth + (0.5 * barWidth) + (yAxisPadding), (width) - (gapWidth + (0.5 * barWidth))]);

    chart.append("g")
      .attr("transform", (hor ? "translate(" + yAxisPadding + ", 0)" : "translate(0, " + (height - xAxisPadding) + ")"))
      //.data(this.model.values["Points"])
      .call(hor ? d3.axisLeft(xAxis): d3.axisBottom(xAxis)).selectAll("text")
      .style("text-anchor", "end")
      .style("text-transform", "capitalize")
      .attr("transform", hor ? "rotate(0)" : "rotate(-45)");

    chart.append("text")
      .attr("transform",
        "translate(" + ((width - yAxisPadding) / 2 + yAxisPadding) + " ," +
        (height - (gapWidth / 2)) + ")")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(hor ? data[0].Metrics.find(x => x["Name"] == met)["DisplayName"] : data[0].Dimensions.find(x => x["Name"] == dim1)["DisplayName"]);

    if(!hor) chart.append("line")
      .style("stroke", "black")
      .style("stroke-width", "1")
      .attr("x1", yAxisPadding)
      .attr("y1", height - xAxisPadding)
      .attr("x2", width)
      .attr("y2", height - xAxisPadding);

    //y-axis

    chart.append("text")
      .attr("transform",
        "translate(" + padding + ", " +
        (((height - (padding * 2) - xAxisPadding) / 2) + padding) + ") rotate(-90)")
      //.attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(hor ? data[0].Dimensions.find(x => x["Name"] == dim1)["DisplayName"] : data[0].Metrics.find(x => x["Name"] == met)["DisplayName"]);

    let y = d3.scaleLinear()
      .domain([0, maxTotalVal * domainPadding])
      .range(hor ? [yAxisPadding, width - (padding * 2)] : [height - xAxisPadding, (padding * 2) + topMargin])
      ;

    chart.append("g")
      .attr("transform", hor ? "translate(0," + (height - (xAxisPadding)) + ")" : "translate(" + yAxisPadding + ", 0)")
      .call(hor ? d3.axisBottom(y).tickFormat(function (d) { /*return "$" + d3.format(d3valueformat)(d);*/return d3.format(d3valueformat)(d); }): 
        d3.axisLeft(y).tickFormat(function (d) { /*return "$" + d3.format(d3valueformat)(d);*/return d3.format(d3valueformat)(d); }))
        .selectAll("text")
      .style("text-anchor", "end")
      .style("text-transform", "capitalize")
      .attr("transform", hor ? "rotate(-45)" : "rotate(0)");


  }

