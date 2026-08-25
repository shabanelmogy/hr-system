import { LineChart } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { TimelineChartProps } from "./AddressTypeChart.types";

const TimelineChart = ({ data }: TimelineChartProps) => {
  const { t } = useTranslation();

  return (
    <LineChart
      data={data}
      title={t("addressTypes.charts.timeline")}
      xKey="month"
      yKey="count"
      height={280}
      fullHeight
      compact
      colors="primary"
      showGrid
      showTooltip
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
    />
  );
};

export default TimelineChart;
