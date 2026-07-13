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
  t: (key: string) => string;
  onAdd?: () => void;
}

export interface InitialLetterChartProps {
  data: InitialLetterData[];
  t: (key: string) => string;
}

export interface LanguageDistributionChartProps {
  data: LanguageData[];
  t: (key: string) => string;
}

export interface LoadingChartStateProps {
  t: (key: string) => string;
}

export interface NameLengthChartProps {
  data: LengthData[];
  t: (key: string) => string;
}

export interface SummaryCardsProps {
  totalAddressTypes: number;
  completeAddressTypes: number;
  recentAddressTypes: number;
  averageNameLength: number;
  t: (key: string) => string;
}

export interface TimelineChartProps {
  data: TimelineData[];
  t: (key: string) => string;
}

