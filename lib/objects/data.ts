import { tpColors, tpDefaultScheme, tpSchemeB } from "./colors";

export class DataResults {
    Start: Date | string;
    End: Date | string;
    Metrics: IMetric[] = [];
    Dimensions: IDimension[] = [];
    Totals: Map<string, string> = new Map<string, string>();
    ResultRows: DataResultRow[] = [];
  }
  
  // export class DataResultRow {
  //   DimensionValues: Map<string, string> = new Map<string, string>();
  //   MetricValues: Map<string, string> = new Map<string, string>();
  // }
  export class DataResultRow {
    DimensionValues: any;
    MetricValues: any;
  }
  
  export interface IMetric {
    Name: string;
    DataType: string;
    DisplayName: string;
  }
  
  export interface IDimension {
    Name: string;
    DataType: string;
    DisplayName: string;
  }

  //data source settings
export class GASettings {
    FiltersExpression: string = "";
    Segment: object = {};
    MaxResults: number = 10000;
    IncludeEmptyRows: boolean = true;
    OrderByField: string;
    SortOrder: string;
  }
  
  //display settings
  export class NumberSettings {
    ShowComparisonChevron: boolean = true;
    InvertChevron: boolean = false;
  }
  
  export interface ISizeSettings {
    width?: number;
    height?: number;
  }
  
  export class LineGraphSettings {
    LineColors?: string[] = tpDefaultScheme;
    PointFormat?: string = ",";
    YAxisFormat?: string = ",";
    RoundedCorners: boolean = true;
  }
  
  export class PieGraphSettings {
    WedgeColors?: string[] = tpSchemeB;
    InnerRadiusPercent?: number = 0;
    LabelFormat?: string = ",";
  }
  
  export class HorizontalBarGraphSettings {
    LabelFormat?: string = ",";
    Colors: string[] = [tpColors.greenDark, tpColors.pink];
  }
  
  export class TileGraphSettings {
    HeightRatio: number;
    YAxisWidth: number = 100;
    TileSpacing: number = 3;
    LabelFormat?: string = ",";
    Color: string = tpColors.blue;
  }
  
  export class GeoGraphSettings {
    LabelFormat?: string = ",";
    Color: string = tpColors.blue;
  }
  
  export class StackedBarGraphSettings {
    Colors: string[] = tpSchemeB;
    LabelFormat: string = ","
    Horizontal: boolean = false;
  }
  
  export class TableSettings {
    PageSize: number = 10;
    SortByDefault: string;
  }
  
  // export interface DateRangeInput {
  //   Start?: Date | string | null;
  //   End?: Date | string | null;
  //   IsComparison: boolean;
  //   StartComparison?: Date | string | null;
  //   EndComparison?: Date | string | null;
  // }
  
  // export class WidgetCellView {
  //   width: number | undefined;
  //   widgets: DashboardWidgetDto[];
  //   stackTitle: string | null;
  // }

  // export class DashboardWidgetDto {
  //   constructor(dashboardId: number,
  //     dataSourceType: string,
  //     start: Date | string,
  //     end: Date | string,
  //     isComparison: boolean,
  //     startComparison: Date | string,
  //     endComparison: Date | string,
  //     timeSpanOption: string
  //   ) {
  //     this.dashboardId = dashboardId;
  //     this.dashboardDataSourceType = dataSourceType;
  //     this.dashboardEnd = end;
  //     this.dashboardStart = start;
  //     this.dashboardIsComparison = isComparison;
  //     this.dashboardEndComparison = endComparison;
  //     this.dashboardStartComparison = startComparison
  //     this.dashboardTimeSpanOption = timeSpanOption;
  
  //   }
  //   id: string | number = 0;
  //   name: string | null;
  //   title: string | null;
  //   subtitle: string | null;
  //   description: string | null;
  //   dataSourceType: string = "None";
  //   dashboardDataSourceType: string;
  //   timeSpanOption: string;
  //   dashboardTimeSpanOption: string;
  //   start: Date | string | null;
  //   end: Date | string | null;
  //   startComparison: Date | string | null;
  //   endComparison: Date | string | null;
  //   isComparison: boolean = false;
  //   dashboardStart: Date | string | null;
  //   dashboardEnd: Date | string | null;
  //   dashboardStartComparison: Date | string | null;
  //   dashboardEndComparison: Date | string | null;
  //   dashboardIsComparison: boolean = false;
  //   serializedDataResults: string = "";
  //   dataResults: DataResults[];
  //   serializedDataSourceSettings: string = null;
  //   dataSourceSettings: object;
  //   inheritDataSource: boolean = true;
  //   inheritDates: boolean = true;
  //   inheritIsComparison: boolean = true;
  //   serializedDisplaySettings: string = null;
  //   displaySettings: object;
  //   displayType: string;
  //   metricNames: string[] = [];
  //   dimensionNames: string[] = [];
  //   width: number;
  //   row: number;
  //   columnStart: number;
  //   stackOrder: number;
  //   stackButtonTitle: string;
  //   dashboardId: string | number = 0;
  // }