﻿import * as svg2png from "svg2png";
import * as d3 from "d3";
import * as JSDOM from "jsdom";
import { lineChartData, lineInfo } from "../global/chartObjects";
import { chartOptions } from "../global/chartOptions";
import { tpSchemeC } from "../global/tp-color-schemes";


export function renderHistoricLineChartToString(data: historicChartData, options: chartOptions): string {
    var svg = getChartJSDOM();
    return String(drawGraph(data, options, svg, () => { }, true, false));
}

export function renderHistoricLineChartGraphInline(data: historicChartData, options: chartOptions, elementId: string): void {
    var svg = d3.select(`#${elementId}`);
    drawGraph(data, options, svg, () => { }, false, false, elementId);
}

export function renderHistoricLineChartToImageURI(callback: Function, data: historicChartData, options: chartOptions): void {
    var svg = getChartJSDOM();
    drawGraph(data, options, svg, callback, false, true);
}

function getChartJSDOM() {
    let dom = new JSDOM.JSDOM('<html><body><div id="chart"></div></html>');
    dom.window.d3 = d3.select(dom.window.document);
    return dom.window.d3.select('#chart')
}

interface historicChartData extends lineChartData {
    standardDeviations?: number,
    average?: number,
    standardDeviation?: number,
}

function drawGraph(data: historicChartData, options: chartOptions, chart: any, callback: Function, convertToString: boolean = false, convertToImage: boolean = false, elementId: string | null = null): (void | string) {
    //function historicDataGraph(target, GraphData, width, height, d3valueformat, rounded)
        const width = options.width || 600;
        const height = options.height || (width / 2);
        const d3valueformat = options.d3ValueFormat || ",";
        const colors = options.colorScheme || tpSchemeC;

        const
            padding = 30,
            yAxisWidth = 65,
            xAxisWidth = 80,
            internalPadding = 35;


        const totalLines = data.lines ? data.lines.length : 0;

        const color = d3.scaleOrdinal(colors);

        const maxTotalVal = d3.max(data.lines.map(l => d3.max(l.points.map(d => Number(d.value))) || 10)) || 10;

        const maxPointCount = d3.max(data.lines.map(l => l.points ? l.points.length : 0)) || 0;

        const x = d3.scaleLinear()
            .domain([0, maxPointCount - 1])
            .range([internalPadding + padding + yAxisWidth, width - padding - internalPadding]);

        const y = d3.scaleLinear()
            .domain([0, maxTotalVal])
            .range([height - padding - xAxisWidth, padding]);

        const lineFunction = d3.line()
            .x(function (d, i) { return x(i); })
            .y(function (d) { return y(Number(d)); });

        
        
    chart.selectAll("*").remove();

    let svg = chart.append("svg")
            .attr("width", width)
        .attr("height", height);

        if (data.average) {
            const avg = data.average;
            const yAvg = y(avg);
            svg.append("line")
                .attr("class", "line " + "gray-line")
                .style("stroke-width", "2")
                .style("stroke-dasharray", "8, 2")
                .style("opacity", 0.5)
                .attr("x1", yAxisWidth + padding)
                .attr("y1", yAvg)
                .attr("x2", width - padding - 1 - (internalPadding / 2))
                .attr("y2", yAvg);

            svg.append("text")
                .style("opacity", 0.5)
                .attr("y", yAvg)
                .attr("x", width - 1)
                .style("text-anchor", "end")
                .style("alignment-baseline", "middle")
                //.html("x&#772;");
                .text("avg.");

            if (data.standardDeviation && data.standardDeviations) {
                const stddev = data.standardDeviation;
                const stddevs = data.standardDeviations;
                const boundtop = (stddev * stddevs) + avg;
                var boundbottom = avg - (stddev * stddevs);
                if (boundtop > 0 && boundtop <= maxTotalVal) {
                    let yVal = y(boundtop);
                    chart.append("line")
                        .attr("class", "line " + colors[colors.length - 1] + "-line")
                        .style("stroke-width", "2")
                        .style("stroke-dasharray", "8, 2")
                        .style("opacity", 0.3)
                        .attr("x1", yAxisWidth + padding)
                        .attr("y1", yVal)
                        .attr("x2", width - padding - 1 - (internalPadding / 2))
                        .attr("y2", yVal);

                    chart.append("text")
                        .style("opacity", 0.5)
                        .attr("y", yVal)
                        .attr("x", width - 1)
                        .style("text-anchor", "end")
                        .style("alignment-baseline", "middle")
                        //.text(stddevs.toString() + "s");
                        .text(stddevs.toString() + "σ");

                }
                if (boundbottom > 0 && boundbottom <= maxTotalVal) {
                    let yVal = y(boundbottom);
                    chart.append("line")
                        .attr("class", "line " + colors[colors.length - 1] + "-line")
                        .style("stroke-width", "2")
                        .style("stroke-dasharray", "8, 2")
                        .style("opacity", 0.3)
                        .attr("x1", yAxisWidth + padding)
                        .attr("y1", yVal)
                        .attr("x2", width - padding - 1 - (internalPadding / 2))
                        .attr("y2", yVal);

                    chart.append("text")
                        .style("opacity", 0.5)
                        .attr("y", yVal)
                        .attr("x", width - 1)
                        .style("text-anchor", "end")
                        .style("alignment-baseline", "middle")
                        //.text("-" + stddevs.toString() + "s");
                        .text("-" + stddevs.toString() + "σ");
                }
            }

        }

        //if (GraphData["GroupLabels"]) {
        //    var labels = GraphData["GroupLabels"];
        //    var topLabels = d3.scaleLinear()
        //        .domain([0, labels.length - 1])
        //        .range([internalPadding + padding + yAxisWidth, width - padding - internalPadding])
        //}

        for (var i = totalLines - 1; i >= 0; i--) {
            let currentLine = data.lines[i].points.map(x => Number(x.value));

            svg.append("g")
                .attr("id", "line-" + i.toString())
                .append("path").data([currentLine])
                .attr("class", "line " + colors[i % colors.length] + "-line")
                .attr("d", lineFunction);

            if (i == 0) {
                svg.append("circle") // Uses the enter().append() method
                    .attr("class", "dot " + colors[colors.length - 1]) // Assign a class for styling
                    .attr("cx", x(currentLine.length - 1))
                    .attr("cy", y(currentLine[currentLine.length - 1]))
                    .attr("r", 6);
            }

            //chart.append("circle") // Uses the enter().append() method
            //    .attr("class", "dot " + color(i+1)) // Assign a class for styling
            //    .attr("cx", x(currentLine.length - 1))
            //    .attr("cy", y(currentLine[currentLine.length - 1]))
            //    .attr("r", 6);

        }

        //let currentLine = GraphData["Bars"].map(function (b) {
        //    return b["Values"][0];
        //});
        //chart.append("circle") // Uses the enter().append() method
        //    .attr("class", "dot " + color(i-1)) // Assign a class for styling
        //    .attr("cx", x(currentLine.length - 1))
        //    .attr("cy", y(currentLine[currentLine.length - 1]))
        //    .attr("r", 6);



        //AXES

        //x axis
        var xLabels = data.lines[0].points.map(function (d) {
            return new Date(String(d.label));
        });

        let months:number[] = [];
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        for (var i = 0; i < xLabels.length; i++) {
            if (months.indexOf(xLabels[i].getMonth()) == -1) {
                months.push(xLabels[i].getMonth())
            } else {
                months = months
            }
        }

        let month_ranges = [0]
        let monthcount = 0

        let axisWidth = width - (2 * (internalPadding + padding)) - yAxisWidth;

        for (var i = 1; i <= months.length; i++) {
            let totalcount = xLabels.length
            monthcount += xLabels.filter(options => options.getMonth() === months[i - 1]).length
            month_ranges[i] = (axisWidth / totalcount * monthcount);


            let monthScale = d3.scaleBand()
                .range([yAxisWidth + padding + internalPadding + month_ranges[i - 1], yAxisWidth + padding + internalPadding + month_ranges[i]])

            let monthAxis = chart.append("g")
                .attr('transform', `translate(0, ${height - xAxisWidth})`)
                .call(d3.axisBottom(monthScale).tickSize(-5));

            monthAxis.select(".domain").remove();


            chart.append("text")
                //.attr("class", "axis")
                .style("font-size", ".85rem")
                .style("opacity", "0.85")
                .data(xLabels)
                .attr("y", height - xAxisWidth + 15)
                .attr("x", yAxisWidth + padding + internalPadding + (month_ranges[i - 1] + (month_ranges[i] - month_ranges[i - 1]) / 2))
                .style("text-anchor", "middle")
                .text(monthNames[months[i - 1]])

        }



        //var numMonths = xLabels.map(function (d) {
        //    return d.getMonth();
        //})
        //numMonths = (new Set(numMonths)).size;

        var xAxis = d3.scaleTime()
            .domain([xLabels[0], xLabels[xLabels.length - 1]])/*.nice()*/
            .range([internalPadding + padding + yAxisWidth, width - padding - internalPadding]);

    var dayDiff = Math.ceil(Math.abs(xLabels[xLabels.length - 1].valueOf() - xLabels[0].valueOf()) / (1000 * 60 * 60 * 24)); //difference in days

        var ticks = dayDiff <= 15 ? d3.timeDay.every(1) : 15;


        chart.append("g")
            .attr("transform", "translate(0, " + (height - xAxisWidth - padding) + ")")
            //.data(GraphData["Points"])
            .call(d3.axisBottom(xAxis).ticks(ticks)./*tickFormat(d3.timeFormat("%-d")).*/tickSizeOuter(0)).selectAll("text").style("text-anchor", "middle");

        //var xAxisNode = chart.append('g');
        //xAxisNode
        //    .attr("transform", "translate(0, " + (height - xAxisWidth) + ")")
        //    .call(d3.axisBottom().scale(xAxis).ticks(numMonths <= 1 ? 0.4 : d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%B")).tickSizeOuter(0).tickSizeInner(0)).selectAll("text")
        //    .attr("font-size", "0.8rem")
        //    .style("text-anchor", "middle");
        //xAxisNode.select(".domain").remove()
        //.style("text-anchor", "end")
        //.attr("transform", "rotate(-45)");

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
            .style("text-anchor", "middle")
            .text(data.xLabel);

        //y axis

        chart.append("text")
            .attr("transform",
                "translate(" + padding + ", " +
                (((height - (padding * 2) - xAxisWidth) / 2) + padding) + ") rotate(-90)")
            //.attr("transform", "rotate(-90)")
            .style("text-anchor", "middle")
            .text(data.yLabel);

        chart.append("g")
            .attr("transform", "translate(" + (yAxisWidth + padding) + ", 0)")
            .call(d3.axisLeft(y).tickFormat(function (d) { return d3.format(d3valueformat)(d); }));

    if (data.standardDeviation && data.standardDeviations) {
            chart.append("text")
                .style("opacity", 0.5)
                .attr("y", height - 4)
                .attr("x", width - 1)
                .style("text-anchor", "end")
                .style("alignment-baseline", "end")
                .style("font-size", "0.7rem")
                //.text(stddevs.toString() + "s");
                .text("σ: standard deviation from the average");
        }


        return chart;
}