//const svg2png = require("svg2pn")
//import { JSDOM } from "jsdom";
//const d3 = require('d3');
import 'd3';
import { JSDOM } from "jsdom";
import d3 = require('d3');
import svg2png = require('svg2png');

export function drawTestGraph(callback: Function, width: number, height: number, convertToImage: boolean = false):(void | string) {
    let dom = new JSDOM('<html><body><div id="chart"></div></html>');
    dom.window.d3 = d3.select(dom.window.document);

    var radius = Math.min(width, height) / 2;

    interface datum  { label: string, count: number };

    let data: datum[] = [
        { label: "Abulia", count: 10 },
        { label: "Betelgeuge", count: 22 },
        { label: "Cantaloupe", count: 15 },
        { label: "Dijkstra", count: 30 },
    ];

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    let svg = dom.window.d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    let g = svg
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    //const pie = d3.pie()
    //    .value(function (d) { return Number(d); })
    //    .sort(null);

    const pie = d3.pie();

    let arcs = g.selectAll("arc")
        .data(pie(data.map(x => x.count)))
        .enter()
        .append("g");

    let path = arcs.append("path")
        .data(data)
        .enter()
        .attr("fill", function (d: datum, i: number) {
            return color(d.label);
        });

    //var path = svg.selectAll('path')
    //    //.data(pie(data))
    //    .data(data)
    //    .enter()
    //    .append('path')
    //    .attr('d', arc)
    //    .attr('fill', function (d: datum) {
    //        return color(d.label);
    //    });

    // Convert SVG to PNG and return it to controller
    var svgText: string = dom.window.d3.select('#chart').html();

    if (convertToImage) {
        svg2png(Buffer.from(svgText), { width: width, height: height })
            .then(buffer => 'data:image/png;base64,' + buffer.toString('base64'))
            .then(buffer => callback(null, buffer));
    }
    else {
        return svgText;
    }
}