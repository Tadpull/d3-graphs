import * as svg2png from "svg2png";
import * as d3 from "d3";
import * as JSDOM from "jsdom";
import { ISizeSettings, PieGraphSettings } from "../global/chartOptions";
import { tpColors, tpSchemeB, tpSchemeC } from "../global/tp-color-schemes";
import { DataResults } from "../global/dataObjects";


export function renderPieGraphToString(callback: Function, data: DataResults[], options: PieGraphSettings, size: ISizeSettings): string {
    var svg = getChartJSDOM();
    return String(drawGraph(data, options, size, svg, callback, true, false));
}

export function renderPieGraphInline(data: DataResults[], options: PieGraphSettings, size: ISizeSettings, elementId: string): void {
    var svg = d3.select(`#${elementId}`);
    drawGraph(data, options, size, svg, () => { }, false, false, elementId);
}

export function renderPieGraphToImageURI(callback: Function, data: DataResults[], options: PieGraphSettings, size: ISizeSettings): void {
    var svg = getChartJSDOM();
    drawGraph(data, options, size, svg, callback, false, true);
}

function getChartJSDOM() {
    let dom = new JSDOM.JSDOM('<html><body><div id="chart"></div></html>');
    dom.window.d3 = d3.select(dom.window.document);
    return dom.window.d3.select('#chart')
}

function drawGraph(data: DataResults[], displaySettings: PieGraphSettings, size: ISizeSettings, chart: any, callback: Function, convertToString: boolean = false, convertToImage: boolean = false, elementId: string | null = null): (void | string) {

    if (!data || data.length != 1 || !data[0].ResultRows || data[0].ResultRows.length < 1 || data[0].Metrics.length != 1 || data[0].Dimensions.length != 1) {
        throw new RangeError("Input data in unexpected format.");
    }    

    const width = size.width || 600;
    const labelFormat = displaySettings.labelFormat || ",";
    const colors = displaySettings.wedgeColors || tpSchemeB;

    const
        paddingLR = .25 * width,
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
        total += Number(x.MetricValues.get(met.name));
    })

    const color = d3.scaleOrdinal(colors);

    chart.selectAll("*").remove();

    let svg = chart.append("svg")
        .data([results])
        .attr("width", width)
        .attr("height", height);

    const g = svg.append("g").attr('transform', 'translate(' + (radius + paddingLR) + "," + (radius + paddingTB) + ")");


    const pie = d3.pie()
        .value(function (d: any) { return Number(d.MetricValues.get(met.name)); })
        .sort(null);

    const arc = d3.arc()
        .innerRadius((displaySettings?.innerRadiusPercent || 0) * radius)
        .outerRadius(radius);

    const arcs = g.selectAll("arcs")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("fill",
            function (d: any, i: number) {
                return color(i.toString());
            })
        .attr("d", arc);

    const labels = svg.append("g").attr("transform", 'translate(' + (paddingLR) + ", " + (height - paddingTB) + ")");
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
            .attr("x", xStart +  (size * 2) + 10)
            .attr("y", yStart + (size / 2))
            .text(results[i].DimensionValues.get(dim.name) || "")
            .style("alignment-baseline", "middle")
        .attr("text-anchor", "left")
    }
        //.attr("d", arc).on('mouseover', function (event, d) {
        //    d3.select(this).transition()
        //})

   

    if (convertToImage || convertToString) {
        let svgText: string = chart.html();


        // Optionally convert SVG to PNG and return it to callback as data URI
        if (convertToImage) {
            svg2png(Buffer.from(svgText), { width: width, height: height })
                .then(buffer => 'data:image/png;base64,' + buffer.toString('base64'))
                .then(buffer => {
                    callback(null, buffer);
                    return buffer;
                });
        }
        // Otherwise return the HTML string
        else if (convertToString) {
            callback(null, svgText);
            return svgText;
            //return svgText;
        }
    }
}