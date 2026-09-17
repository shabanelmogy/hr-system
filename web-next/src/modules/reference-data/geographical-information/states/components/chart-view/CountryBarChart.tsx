import BarChart from "@/shared/components/charts/cartesian/BarChart";
import { COLOR_PALETTES } from "@/shared/components/charts/palette";
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

export default CountryBarChart;
