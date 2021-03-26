

interface pointInfo {
    value: number | string;
    label?: string;
    hoverColor?: string;
    radius?: string | number;
}

interface lineInfo {
    points: pointInfo[]
    label?: string;
    rounded?: boolean;
    color?: string;
    dashed?: boolean;
    thickness?: string | number;
}

interface lineChartData {
    lines: lineInfo[];
    title?: string;
    xLabel?: string;
    yLabel?: string;
}

export {
    pointInfo,
    lineInfo,
    lineChartData,
}