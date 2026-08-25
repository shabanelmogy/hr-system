import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { StateData } from "./chartDataUtils";

interface StateBarChartProps {
  data: StateData[];
}

const StateBarChart = ({ data }: StateBarChartProps) => {
  const { t } = useTranslation();

  return (
    <BarChart
      data={data}
      title={t("districts.charts.districtsByState")}
      subtitle={t("districts.charts.districtsByStateDescription")}
      xKey="name"
      yKey="value"
      height={280}
      fullHeight
      compact
      colors={COLOR_PALETTES.primary}
      showGrid
      showTooltip
      barRadius={4}
      orientation="vertical"
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
    />
  );
};

export default StateBarChart;
