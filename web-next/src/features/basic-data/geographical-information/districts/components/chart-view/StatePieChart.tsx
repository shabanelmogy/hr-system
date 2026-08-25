import { PieChart } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { StateData } from "./chartDataUtils";

interface StatePieChartProps {
  data: StateData[];
  colors: string[];
}

const StatePieChart = ({ data, colors }: StatePieChartProps) => {
  const { t } = useTranslation();

  return (
    <PieChart
      data={data}
      title={t("districts.charts.stateShare")}
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

export default StatePieChart;
