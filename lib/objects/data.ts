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
  
  export class BarGraphSettings {
    LabelFormat?: string = ",";
    Colors: string[] = [tpColors.greenDark, tpColors.pink];
    BarThickness: number = 30;
    BarPadding:number = 15;
    Vertical: boolean = false
  }

  export class GroupedBarGraphSettings {
    LabelFormat?:string = ",";
    Colors: string[] = [tpColors.blue, tpColors.yellow]
    BarThicknessPercent:number = 0.5;
    BlockWidth: number = 100;
    Vertical: boolean = false;
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
    SortByLargest: boolean = false;
  }
  
  export class TableSettings {
    PageSize: number = 10;
    SortByDefault: string;
  }

  
export interface IDataGroup {
  name: string;
  displayName: string;
  points: IDataPoint[]
}
export interface IDataPoint {
  x?: any;
  y?: number | string;
}