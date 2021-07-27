'use strict';
const outputFile = require('output-file');
var innerHtml = "";


var expect = require('chai').expect;
var index = require('../dist/index.js');
describe('graph functions test', () => {

    let promises = []

    promises.push(new Promise((resolve, reject) => {
            it('should return a pie chart html string', () => {
                var result = index.renderTestGraphToString(() => { }, 400, 400);
            expect(result).to.be.a("string").that.contains("svg");
                let html = `<h2>1. Sample Pie Chart SVG</h2>${result}`;
            resolve(html);
        });
    }));

    promises.push(new Promise((resolve, reject) => {
        it('should return a pie chart data URI', () => {
            let callback = (i, uri) => {
                expect(uri).to.be.a("string").that.has.length.above(0);
                let html = `<h2>2. Sample Pie Chart Image</h2><img src='${uri}'/>`;
                resolve(html);
            }
            index.renderTestGraphToImageURI(callback, 400, 400);
        })
    }))

    let historicData = {
        lines: [
            {
                points: [
                    {
                        value: 3,
                        label: "3-27-2020",
                    },
                    {
                        value: 8,
                        label: "3-28-2020",
                    },
                    {
                        value: 4,
                        label: "3-29-2020",
                    },
                ],
            },
            {
                points: [
                    {
                        value: 5,
                        label: "3-27-2020",
                    },
                    {
                        value: 6,
                        label: "3-28-2020",
                    },
                    {
                        value: 2,
                        label: "3-29-2020",
                    },
                ],
            }
        ],

        standardDeviations: 2.5,
        average: 5,
        standardDeviation: 1.1,
    }

    let historicOptions = {
        width: 600,
        height: 400,
        d3ValueFormat: "$,"
    }

    promises.push(new Promise((resolve, reject) => {
        it('should return historic data ribbit graph', () => {
            var result = index.renderHistoricLineChartToString(() => { }, historicData, historicOptions);
            expect(result).to.be.a("string").that.contains("svg");
            let html = `<h2>3. Sample Historic Data Chart SVG</h2>${result}`;
            resolve(html);
        });
    }));

    promises.push(new Promise((resolve, reject) => {
        it('should return historic data ribbit graph', () => {
            let callback = (i, uri) => {
                expect(uri).to.be.a("string").that.has.length.above(0);
                let html = `<h2>4. Sample Historic Data Chart Image</h2>$<img src='${uri}'>`;
                resolve(html);
            }
            index.renderHistoricLineChartToImageURI(callback, historicData, historicOptions);
        });
    }));


    let genderdata = [
        {
            Start: "2021-01-01",
            End: "2021-01-31",
            Totals: new Map(),
            Metrics: [
                {
                    name: "ga:users",
                    displayName: "Users"
                }
            ],
            Dimensions: [
                {
                    name: "ga:gender",
                    displayName: "Gender"
                }
            ],
            ResultRows: [
                {
                    MetricValues: new Map(),
                    DimensionValues: new Map()
                },
                {
                    MetricValues: new Map(),
                    DimensionValues: new Map()
                }
            ]
        }
    ];

    genderdata[0].ResultRows[0].MetricValues.set("ga:users", "200");
    genderdata[0].ResultRows[0].DimensionValues.set("ga:gender", "Male");
    genderdata[0].ResultRows[1].MetricValues.set("ga:users", "315");
    genderdata[0].ResultRows[1].DimensionValues.set("ga:gender", "Female");

    let genderDisplaySettings = {
    }

    let genderSizeSettings = {
        width: 600,
    }

    promises.push(new Promise((resolve, reject) => {
        it('should render pie graph to image', () => {
            let callback = (i, uri) => {
                expect(uri).to.be.a("string").that.has.length.above(0);
                let html = `<h2>5. Sample Pie Data Chart Image</h2>$<img src='${uri}'>`;
                resolve(html);
            }
            index.renderPieGraphToImageURI(callback, genderdata, genderDisplaySettings, genderSizeSettings);
        });
    }));

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