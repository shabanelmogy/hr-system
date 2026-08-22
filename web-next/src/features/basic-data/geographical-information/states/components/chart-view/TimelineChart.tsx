import { AreaChart, COLOR_PALETTES } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";
import type { TimelineData } from "./chartDataUtils";

interface TimelineChartProps {
  data: TimelineData[];
}

const TimelineChart = ({ data }: TimelineChartProps) => {
  const { t } = useTranslation();
  if (data.length === 0) return null;

  return (
    <AreaChart
      data={data}
      title={t("states.charts.timeline")}
      xKey="month"
      yKey="cumulative"
      height={280}
      fullHeight
      compact
      colors={COLOR_PALETTES.success}
      showGrid
      showTooltip
      gradient
      strokeWidth={2}
      fillOpacity={0.3}
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? "")}
      subtitle={undefined}
    />
  );
};

export default TimelineChart;
