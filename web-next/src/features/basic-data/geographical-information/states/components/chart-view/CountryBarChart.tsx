import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { CountryData } from "./chartDataUtils";

interface CountryBarChartProps {
  data: CountryData[];
}

const CountryBarChart = ({ data }: CountryBarChartProps) => {
  const { t } = useTranslation();

  return (
    <BarChart
      data={data}
      title={t("states.charts.statesByCountry")}
      subtitle={t("states.charts.statesByCountryDescription")}
      xKey="name"
      yKey="value"
      height={400}
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

export default CountryBarChart;
