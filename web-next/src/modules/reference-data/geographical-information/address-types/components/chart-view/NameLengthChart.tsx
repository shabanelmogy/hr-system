import { BarChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { NameLengthChartProps } from "./AddressTypeChart.types";

const NameLengthChart = ({ data }: NameLengthChartProps) => {
  const { t } = useTranslation();

  return (
    <BarChart
      data={data}
      title={t("addressTypes.charts.nameLength")}
      xKey="name"
      yKey="value"
      height={280}
      fullHeight
      compact
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

export default NameLengthChart;
