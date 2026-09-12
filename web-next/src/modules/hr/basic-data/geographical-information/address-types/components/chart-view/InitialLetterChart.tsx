import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { InitialLetterChartProps } from "./AddressTypeChart.types";

const InitialLetterChart = ({ data }: InitialLetterChartProps) => {
  const { t } = useTranslation();

  return (
    <BarChart
      data={data}
      title={t("addressTypes.charts.byInitialLetter")}
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

export default InitialLetterChart;
