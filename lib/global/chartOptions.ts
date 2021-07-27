import { tpSchemeA, tpSchemeB } from "./tp-color-schemes";

interface chartOptions {
    d3ValueFormat?: string;
    width: number;
    height?: number;
    colorScheme?: string[];
}

interface ISizeSettings {
    width?: number;
    height?: number;
}

class LineGraphSettings {
    lineColors?: string[] = tpSchemeA;
    pointformat?: string = ",";
    yaxisformat?: string = ",";
}

class PieGraphSettings {
    wedgeColors?: string[] = tpSchemeB;
    innerRadiusPercent?: number = 0;
    labelFormat?: string = ",";
}

export {
    chartOptions,
    ISizeSettings,
    LineGraphSettings,
    PieGraphSettings,
};