class DataResults {
    Start: Date | string = new Date();
    End: Date | string = new Date();
    Metrics: IMetric[] = [];
    Dimensions: IDimension[] = [];
    Totals: Map<string, string> = new Map<string, string>();
    ResultRows: DataResultRow[] = [];
}

class DataResultRow {
    DimensionValues: Map<string, string> = new Map<string, string>();
    MetricValues: Map<string, string> = new Map<string, string>();
}

interface IMetric {
    name: string;
    dataType: string;
    displayName: string;
}

interface IDimension {
    name: string;
    dataType: string;
    displayName: string;
}

export {
    DataResults,
    DataResultRow,
    IMetric,
    IDimension
}