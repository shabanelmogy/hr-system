import { PieChart } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { LanguageDistributionChartProps } from "./AddressTypeChart.types";

const LanguageDistributionChart = ({ data, colors }: LanguageDistributionChartProps) => {
  const { t } = useTranslation();

  return (
    <PieChart
      data={data}
      title={t("addressTypes.charts.languageDistribution")}
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

export default LanguageDistributionChart;
