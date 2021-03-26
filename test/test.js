'use strict';
const outputFile = require('output-file');
var innerHtml = "";


var expect = require('chai').expect;
var index = require('../dist/index.js');
describe('graph functions test', () => {

    let promises = []

    promises.push(new Promise((resolve, reject) => {
            it('should return a pie chart html string', () => {
            var result = index.renderTestGraphToString(400, 400);
            expect(result).to.be.a("string").that.contains("svg");
                //innerHtml += `<h2>1. Sample Pie Chart</h2>${result}`;
                let html = `<h2>1. Sample Pie Chart SVG</h2>${result}`;
            resolve(html);
        });
    }));

    promises.push(new Promise((resolve, reject) => {
        it('should return a pie chart data URI', () => {
            let callback = (i, uri) => {
                //console.log(i);
                //console.log(uri);
                expect(uri).to.be.a("string").that.has.length.above(0);
                //innerHtml += `<h2>2. Sample Pie Chart Image</h2><img src='${uri}'/>`;
                let html = `<h2>2. Sample Pie Chart Image</h2><img src='${uri}'/>`;
                resolve(html);
            }
            index.renderTestGraphToImageURI(callback, 400, 400);
        })
    }))
    

    //PLACE LAST IN ORDER
    //Do not modify
    //This one outputs the HTML to file

    it('should have concatenated html', () => {
    Promise.all(promises).then((values) => {
            innerHtml = values.join();
            expect(innerHtml).to.be.a("string").that.has.length.above(0);

            (async () => {
                const fullHtml = `<!DOCTYPE html><html lang='en'><head><meta charset="utf-8" /><title>Tadpull Graphs Test</title></head><body>
            <h1>Test Outputs</h1>
            <div id="output">
            ${innerHtml}
            </div></body></html>`;
                console.log("done with outerhtml");
                await outputFile('test/HTMLtestoutput.html', fullHtml);
            })();
        })
    });
    
});