export interface AppChartDatum {
  key: string;
  label: string;
  value: number;
  color?: string;
}

export interface AppChartSummaryItem {
  key: string;
  label: string;
  value: number | string;
}
