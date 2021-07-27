import { renderTestGraphInline, renderTestGraphToImageURI, renderTestGraphToString } from "./graphs/test";
import { renderHistoricLineChartInline, renderHistoricLineChartToImageURI, renderHistoricLineChartToString } from "./graphs/historic-line-chart";
import { renderPieGraphInline, renderPieGraphToImageURI, renderPieGraphToString } from "./graphs/pie-graph";
import * as tpColorSchemes from "./global/tp-color-schemes";
import * as chartOptions from "./global/chartOptions";
import * as chartObjects from "./global/chartObjects";

export {
    renderTestGraphToString,
    renderTestGraphToImageURI,
    renderTestGraphInline,

    renderHistoricLineChartInline,
    renderHistoricLineChartToImageURI,
    renderHistoricLineChartToString,

    renderPieGraphInline,
    renderPieGraphToImageURI,
    renderPieGraphToString,

    tpColorSchemes,
    chartOptions,
    chartObjects,
};
