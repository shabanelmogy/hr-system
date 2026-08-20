import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart } from "@/shared/components/charts";
import type { StatesData } from "./chartDataUtils";

interface StatesChartProps {
  data: StatesData[];
}

const StatesChart: React.FC<StatesChartProps> = ({ data }) => {
  const { t } = useTranslation();
  // Transform data for the bar chart
  const chartData = data.map((item) => ({
    name: item.name,
    states: item.statesCount,
  }));

  return (
    <BarChart
      title={t("countries.charts.statesByCountry")}
      subtitle={t("countries.charts.statesByCountryDesc")}
      data={chartData}
      xKey="name"
      multiSeries={[
        {
          key: "states",
          name: t("countries.charts.activeStates"),
          color: "#2196F3",
        }
      ]}
      height={400}
      showLegend={true}
      showTooltip={true}
      showGrid={true}
    />
  );
};

export default StatesChart;
