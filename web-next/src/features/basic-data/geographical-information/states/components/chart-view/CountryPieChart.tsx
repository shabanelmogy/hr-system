import { PieChart } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { CountryData } from "./chartDataUtils";

interface CountryPieChartProps {
  data: CountryData[];
  colors: string[];
}

const CountryPieChart = ({ data, colors }: CountryPieChartProps) => {
  const { t } = useTranslation();

  return (
    <PieChart
      data={data}
      title={t("states.charts.countryShare")}
      nameKey="name"
      valueKey="value"
      height={400}
      colors={colors}
      showLegend
      showTooltip
      showLabels
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
    />
  );
};

export default CountryPieChart;
