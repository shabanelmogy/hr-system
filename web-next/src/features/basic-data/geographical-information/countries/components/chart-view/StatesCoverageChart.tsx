import { PieChart } from "@/shared/components/charts";
import type { StatesCoverageData } from "./chartDataUtils";
import { useTranslation } from "react-i18next";

interface StatesCoverageChartProps {
  data: StatesCoverageData[];
  colors: string[];
}

const StatesCoverageChart = ({ data, colors }: StatesCoverageChartProps) => {
  const { t } = useTranslation();

  return (
    <PieChart
      data={data}
      title={t("countries.charts.statesCoverage")}
      nameKey="name"
      valueKey="value"
      height={280}
      fullHeight
      compact
      colors={colors}
      showLegend
      showTooltip
      showLabels
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
    />
  );
};

export default StatesCoverageChart;
