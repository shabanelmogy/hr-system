export interface InitialLetterData {
  name: string;
  value: number;
}

export interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

export interface LanguageData {
  name: string;
  value: number;
}

export interface LengthData {
  name: string;
  value: number;
}

export interface ChartLegendProps {
  data: InitialLetterData[];
  colors: string[];
}

export interface EmptyChartStateProps {
  onAdd?: () => void;
}

export interface InitialLetterChartProps {
  data: InitialLetterData[];
}

export interface LanguageDistributionChartProps {
  data: LanguageData[];
  colors: string[];
}

export interface NameLengthChartProps {
  data: LengthData[];
}

export interface SummaryCardsProps {
  totalMatchingAddressTypes: number;
  visibleAddressTypes: number;
  visibleWithAddresses: number;
  visibleWithoutAddresses: number;
}

export interface TimelineChartProps {
  data: TimelineData[];
}

