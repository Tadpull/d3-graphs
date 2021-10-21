import * as d3 from 'd3';
import { DataResults, ISizeSettings, HorizontalBarGraphSettings } from '../objects/data';
import { tpColors } from '../objects/colors';
import { dateMerge } from '../functions/helpers';
export function drawHorizontalBarChart(chart: any, data: DataResults[], size: ISizeSettings, display: HorizontalBarGraphSettings, tooltipId?: string | null): void {

    if (!data || data.length > 2 || data[0].Metrics?.length != 1 || data[0].Dimensions?.length != 1) {
      throw new Error("Data was in an incorrect format.");
    }

    chart.selectAll("*").remove();

    if (tooltipId) {
      var div = d3.select(tooltipId);
    }

    size = size || {
      width: 800,
      height: 600,
    }

    display = display || new HorizontalBarGraphSettings();

    const colors = display?.Colors || [tpColors.greenDark, tpColors.pink];
    const width = size?.width || 800;
    const d3valueformat = display.LabelFormat || ",d";

    const horizontalPadding = 30,
    verticalPadding = 30,
    yAxisWidth = 120,
    xAxisWidth = 75,
    barThickness = 30,
    barPadding = 15;

    const isComparison = data?.length == 2;
    const color = colors[0];
    const negColor = colors[1];
    //green for positive values, pink for negative


    var met = data[0].Metrics[0]["Name"];
    var dim = data[0].Dimensions[0]["Name"];


    let vals: number[];
    if (!isComparison) {
      vals = data[0].ResultRows.map(x => Number(x["MetricValues"][met])); //just get the values for the current time period
    }

    else { //calculate the percent diff between new vs old and set that to be the data
      vals = data[0].ResultRows.map(x => {
        let v2:number = Number(data[1].ResultRows.find(y => y["DimensionValues"][dim] == x["DimensionValues"][dim])?.MetricValues[met] || 0);
        let v1 = Number(x["MetricValues"][met]);
        //let v2 = Number(x["MetricValues"][met]);
        return v2 == 0 ? 0 : (v1 - v2) / v2;
      }
         )
      //let cvals = data[1].ResultRows.map(x => Number(x["MetricValues"][met]));
      //for (let i = 0; i < vals.length; i++) {
      //  vals[i] = cvals[i] == 0 ? 0 : (vals[i] - cvals[i]) / cvals[i];
      //}
    }

    console.log(vals);
    console.log("Is comparison: " + isComparison.toString());

    const maxVal = d3.max(vals.map(function (b) {
      return Math.abs(b);
    })) || 10;

    const minVal = isComparison ? -maxVal : 0;

    const barCount = vals.length;

    const height = size?.height || xAxisWidth + (verticalPadding * 2) + (barCount * barThickness) + ((barCount + 1) * barPadding);


    const x = d3.scaleLinear()
      .domain([0, maxVal])
      .range([0, width - (horizontalPadding * 2) - yAxisWidth]);

    const y = d3.scaleLinear()
      .domain([0, barCount - 1])
      .range([verticalPadding + barPadding, (height - verticalPadding - barPadding - barThickness - xAxisWidth)]);


    const body = chart.append("g");


    const formatCorrectly = function (x) {
      if (!isComparison) { return d3.format(d3valueformat)(x); }
      else {
        return (Number(x) >= 0 ? "+" : "") + d3.format(",d")(x * 100) + "%";
      }
    }

    //middle bar
    const mid = horizontalPadding + yAxisWidth + x(0) + ((width - (horizontalPadding * 2) - yAxisWidth) / 2);
    if (isComparison) {
      chart.append("line")
        .style("stroke", "black")
        .style("stroke-width", "1")
        .attr("x1", mid)
        .attr("y1", 0)
        .attr("x2", mid)
        .attr("y2", height - verticalPadding - xAxisWidth)
    }

    for (let i = 0; i < barCount; i++) {
      let val = vals[i];
      let startx = horizontalPadding + yAxisWidth;
      let xwid = x(Math.abs(val));
      let barcolor = val >= 0 ? color : negColor;
      if (isComparison) {
        startx += ((width - (horizontalPadding * 2) - yAxisWidth) / 2);
        xwid /= 2;
        if (val >= 0) {

        }
        else {
          startx = startx - xwid;
        }
      }
      body.append("rect")
        .attr("class", "bar " + barcolor)
        .attr("fill", barcolor)
        .attr("x", startx)
        .attr("width", xwid)
        .attr("y", y(i))
        .attr("height", barThickness)
        .on('mouseover', function (event, d) {
          if (div) {
            d3.select(this).transition()
              .duration(50)
              .attr('opacity', 0.8);

            let num = formatCorrectly(val);
            if (isComparison) {
              let dimval = data[0].ResultRows[i].DimensionValues[dim];
              let v2 = data[1].ResultRows.find(x => x.DimensionValues[dim] == dimval).MetricValues[met];
              let v1 = data[0].ResultRows.find(x => x.DimensionValues[dim] == dimval).MetricValues[met];
              num = `${d3.format(d3valueformat)(v1)}/${d3.format(d3valueformat)(v2)} (${num})`;
            }
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

    

    //AXES

    //y axis
    var yLabels: any[];
    if (data[0].Dimensions[0]["DataType"] == 'DATETIME') {
      yLabels = Array.from(dateMerge(data[0].Dimensions[0], data[0].ResultRows.map(x => x["DimensionValues"][dim]), data[1].ResultRows.map(x => x["DimensionValues"][dim])).values())
    }
    else {
      yLabels = data[0].ResultRows.map(x => x["DimensionValues"][dim]);
    }
    

    const yAxis = d3.scalePoint()
      .domain(yLabels)
      .range([verticalPadding + barPadding + (barThickness / 2), height - verticalPadding - barPadding - (barThickness / 2) - xAxisWidth]);

    chart.append("g")
      .attr("transform", "translate(" + (yAxisWidth + horizontalPadding) + ",0)")
      //.data(this.model.values["Points"])
      .call(d3.axisLeft(yAxis)).selectAll("text")
      .style("text-transform", "capitalize")
      .style("text-anchor", "end");

    chart.append("line")
      .style("stroke", "black")
      .style("stroke-width", "1")
      .attr("x1", yAxisWidth + horizontalPadding)
      .attr("y1", verticalPadding)
      .attr("x2", yAxisWidth + horizontalPadding)
      .attr("y2", height - xAxisWidth - verticalPadding);


    chart.append("text")
      .attr("transform",
        "translate(" + horizontalPadding + ", " +
        (((height - xAxisWidth) / 2) + verticalPadding) + ") rotate(-90)")
      //.attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(data[0].Dimensions[0]["DisplayName"]);


    ////x axis


    const xAxisScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([0, width - (horizontalPadding * 2) - yAxisWidth]);

    chart.append("g")
      .attr("transform", "translate(" + (horizontalPadding + yAxisWidth) + ", " + (height - verticalPadding - xAxisWidth) + ")")
      .call(d3.axisBottom(xAxisScale).tickFormat(function (d) { return formatCorrectly(d); }))

      .selectAll("text")
      .attr("y", 0)
      .attr("x", -9)
      //.attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    //chart.append("g")
    //    .attr("transform", "translate(" + (yAxisWidth + padding) + ", 0)")
    //    .call(d3.axisLeft().scale(y).tickFormat(function (d) { return d3.format(d3valueformat)(d); }));

    chart.append("text")
      .attr("transform",
        "translate(" + (((width - yAxisWidth) / 2) + yAxisWidth) + ", " +
        (height - verticalPadding) + ")")
      .style("text-anchor", "middle")
      .style("text-transform", "capitalize")
      .text(data[0].Metrics[0]["DisplayName"]);


  }