import * as svg2png from "svg2png";
import * as d3 from "d3";
import * as JSDOM from "jsdom";
import { tpDefaultScheme } from "../global/tp-color-schemes";


export function renderTestGraphToString(width: number, height: number): string {
    var svg = getChartJSDOM();
    return String(drawTestGraph(svg, () => { }, width, height, true, false));
}

export function renderTestGraphInline(elementId: string, width: number, height: number): void {
    var svg = d3.select(`#${elementId}`);
    drawTestGraph(svg, () => { }, width, height, false, false, elementId);
}

export function renderTestGraphToImageURI(callback: Function, width: number, height: number): void {
    var svg = getChartJSDOM();
    drawTestGraph(svg, callback, width, height, false, true);
}

function getChartJSDOM() {
    let dom = new JSDOM.JSDOM('<html><body><div id="chart"></div></html>');
    dom.window.d3 = d3.select(dom.window.document);
    return dom.window.d3.select('#chart')
}

function drawTestGraph(chart: any, callback: Function, width: number, height: number, convertToString: boolean = false, convertToImage: boolean = false, elementId: string |null = null): (void | string) {

    const radius = Math.min(width, height) / 2;

    interface datum { label: string, count: number };

    let data: datum[] = [
        { label: "Abulia", count: 10 },
        { label: "Betelgeuge", count: 22 },
        { label: "Cantaloupe", count: 15 },
        { label: "Dijkstra", count: 30 },
    ];

    let svg = chart
        .append('svg')
        .data([data])
        .attr('width', width)
        .attr('height', height);

    let color = d3.scaleOrdinal(tpDefaultScheme);

    let g = svg
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const pie = d3.pie()
        .value(function (d: any) { return d.count; })
        .sort(null);

    let arcs = g.selectAll("arc")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "arc");

    if (convertToString || convertToImage) {
        arcs.append("path")
            .attr("fill", function (d: any) {
                return color(d.data.label);
            })
            .attr("d", arc);
    }
    else {
        let div = d3.select(`div#tooltip-${elementId}`);
        if (div.empty()) {
            d3.select("body").append("div")
                .attr("class", "d3-tooltip")
                .attr("id", `tooltip-${elementId}`)
                .style("opacity", 0);
        }

        arcs.append("path")
            .attr("fill", function (d: any) {
                return color(d.data.label);
            })
            .attr("d", arc)
            .on('mouseover', function (event:any, d:any) {
                div.transition()
                    .duration(50)
                    .attr('opacity', '.85');
                let num = d.data.count;
                div.html(num.toString())
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 15) + "px");
                div.transition()
                    .duration(50)
                    .style("opacity", 1);
            })
            .on('mouseout', function (event:any, d:any) {
                div.transition()
                    .duration(50)
                    .attr('opacity', '1');
                div.transition()
                    .duration(50)
                    .style("opacity", 0);
            });;
    }

    if (convertToImage || convertToString) {
        let svgText: string = chart.html();


        // Optionally convert SVG to PNG and return it to callback as data URI
        if (convertToImage) {
            svg2png(Buffer.from(svgText), { width: width, height: height })
                    .then(buffer => 'data:image/png;base64,' + buffer.toString('base64'))
                    .then(buffer => callback(null, buffer))
        }
        // Otherwise return the HTML string
        else if (convertToString) {
            return svgText;
        }
    }
}