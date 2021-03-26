'use strict';
const outputFile = require('output-file');
var innerHtml = "";


var expect = require('chai').expect;
var index = require('../dist/index.js');
describe('test graph function test', () => {
    it('should return a pie chart html string', () => {
        var result = index.drawTestGraph(null, 400, 400, false);
        expect(result).to.be.a("string").that.contains("svg");
        innerHtml += `<h2>1. Sample Pie Chart</h2>${result}`;
    });

    it('should have concatenated html', () => {
        expect(innerHtml).to.be.a("string").that.has.length.above(0);
        
        (async () => {
            const fullHtml = `<!DOCTYPE html><html lang='en'><head><meta charset="utf-8" /><title>Tadpull Graphs Test</title></head><body>
    <h1>Test Outputs</h1>
    <div id="output">
    ${innerHtml}
        </div></body></html>`;
                await outputFile('test/HTMLtestoutput.html', fullHtml);
        })();
    })
});