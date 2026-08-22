import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { DistrictData } from "./chartDataUtils";

interface DistrictsChartProps {
  data: DistrictData[];
}

const DistrictsChart = ({ data }: DistrictsChartProps) => {
  const { t } = useTranslation();

  return (
    <BarChart
      data={data}
      title={t("states.charts.districtsByState")}
      subtitle={t("states.charts.districtsByStateDescription")}
      xKey="name"
      yKey="value"
      height={400}
      colors={COLOR_PALETTES.secondary}
      showGrid
      showTooltip
      barRadius={4}
      orientation="horizontal"
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
    />
  );
};

export default DistrictsChart;
