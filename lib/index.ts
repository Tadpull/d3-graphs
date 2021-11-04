// import { testGraph } from "./graphs/test";
import { historicLineGraph } from "./graphs/historic-line-chart";
// import { pieGraph } from "./graphs/pie-graph";
// import * as tpColorSchemes from "./global/tp-color-schemes";
// import * as chartOptions from "./global/chartOptions";
// import * as chartObjects from "./global/chartObjects";
// import * as dataObjects from './global/dataObjects';



// export {
//     testGraph,
//     historicLineGraph,
//     pieGraph,

//     tpColorSchemes,
//     chartOptions,s
//     chartObjects,
//     dataObjects,
// };

//import * as tpColorSchemes from './objects/colors';
//import * as dataObjects from './objects/data';

import {
 tpColors,
 tpDefaultScheme,
 tpSchemeA,
 tpSchemeB,
 tpSchemeC
} from './objects/colors'

import {
 parseDate,
 parseDates,
 dateMerge,
 mergeLabels,
 GetDateLabels,
MapDateDimensions,
monthNames,
weekdayNames
} from './functions/helpers'

import { drawPieChart } from './graphs/pie-chart';
import { drawStackedBarChart } from './graphs/stacked-bar-chart';
import { drawBarChart } from './graphs/bar-chart';
import { drawLineChart } from './graphs/line-graph';
import { drawHorizontalTileChart } from './graphs/horizontal-tile-chart';
import { drawUsaGeoChart } from './graphs/usa-geo-chart';
import { drawGroupedBarChart } from "./graphs/grouped-bar-chart";

import { DataResultRow,
    DataResults,
IMetric,
IDimension,
NumberSettings,
ISizeSettings,
LineGraphSettings,
PieGraphSettings,
BarGraphSettings,
GeoGraphSettings,
TileGraphSettings,
StackedBarGraphSettings,
GroupedBarGraphSettings,
TableSettings,
IDataGroup,
IDataPoint,
 } from './objects/data';

export {
    tpColors,
    tpDefaultScheme,
    tpSchemeA,
    tpSchemeB,
    tpSchemeC,
    //dataObjects,
    IDataGroup,
    IDataPoint,
    DataResults,
    DataResultRow,
    IMetric,
    IDimension,
    NumberSettings,
    ISizeSettings,
    LineGraphSettings,
    PieGraphSettings,
    GeoGraphSettings,
    BarGraphSettings,
    TileGraphSettings,
    StackedBarGraphSettings,
    GroupedBarGraphSettings,
    TableSettings,
    drawPieChart,
    drawStackedBarChart,
    drawBarChart,
    drawLineChart,
    drawHorizontalTileChart,
    drawUsaGeoChart,
    drawGroupedBarChart,
    parseDate,
    parseDates,
    dateMerge,
    mergeLabels,
    GetDateLabels,
    MapDateDimensions,
    monthNames,
    weekdayNames,

    historicLineGraph,
};