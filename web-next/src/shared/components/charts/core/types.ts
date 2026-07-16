import type { ReactNode } from "react";

import type { ChartColors } from "./chartUtils";

export type ChartDatum = object;
export type ChartData<TDatum extends ChartDatum = ChartDatum> = readonly TDatum[];
export type ChartFormatter = (value: unknown) => string;
export type ChartInteractionHandler<TDatum extends ChartDatum = ChartDatum> = (
  data: TDatum,
  index: number,
) => void;

export interface ChartSeries {
  key: string;
  name?: string;
  color?: string;
  dasharray?: string;
}

export interface ChartTooltipEntry {
  color?: string;
  name?: ReactNode;
  value?: unknown;
  payload?: unknown;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: readonly ChartTooltipEntry[];
  label?: unknown;
}

export const getChartValue = (datum: object, key: string): unknown =>
  (datum as Record<string, unknown>)[key];

export const getChartNumber = (datum: object, key: string): number => {
  const value = getChartValue(datum, key);
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

export interface CartesianChartProps {
  data?: ChartData;
  xKey?: string;
  yKey?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  height?: number | string;
  colors?: ChartColors;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  loading?: boolean;
  error?: unknown;
  gradient?: boolean;
  multiSeries?: readonly ChartSeries[];
  formatValue?: ChartFormatter;
  formatLabel?: ChartFormatter;
}

export interface TimelineChartBaseProps {
  data?: ChartData;
  title?: ReactNode;
  subtitle?: ReactNode;
  height?: number;
  loading?: boolean;
  error?: unknown;
  gradient?: boolean;
  showConnectors?: boolean;
  dateKey?: string;
  titleKey?: string;
  descriptionKey?: string;
  statusKey?: string;
  valueKey?: string;
  formatValue?: ChartFormatter;
  formatDate?: (value: string | number | Date) => string;
  onItemClick?: ChartInteractionHandler;
}
