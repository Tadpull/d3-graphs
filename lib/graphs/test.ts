import * as svg2png from "svg2png";
import * as d3 from "d3";
import * as JSDOM from "jsdom";



export function drawTestGraph(callback: Function, width: number, height: number, convertToImage: boolean = false): (void | string) {
    let dom = new JSDOM.JSDOM('<html><body><div id="chart"></div></html>');
    dom.window.d3 = d3.select(dom.window.document);

    const radius = Math.min(width, height) / 2;

    interface datum { label: string, count: number };

    let data: datum[] = [
        { label: "Abulia", count: 10 },
        { label: "Betelgeuge", count: 22 },
        { label: "Cantaloupe", count: 15 },
        { label: "Dijkstra", count: 30 },
    ];

    let color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg = dom.window.d3.select('#chart')
        .append('svg')
        .data([data])
        .attr('width', width)
        .attr('height', height);

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

    arcs.append("path")
        .attr("fill", function (d: any) {
            return color(d.data.label);
        })
        .attr("d", arc);

    let svgText: string = dom.window.d3.select('#chart').html();


    // Optionally convert SVG to PNG and return it to callback as data URI
    if (convertToImage) {
        svg2png(Buffer.from(svgText), { width: width, height: height })
            .then(buffer => 'data:image/png;base64,' + buffer.toString('base64'))
            .then(buffer => callback(null, buffer));
    }
    // Otherwise return the HTML string
    else {
        return svgText;
    }
}