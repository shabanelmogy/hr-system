import { ChartContainer } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";

const LoadingChartState = () => {
  const { t } = useTranslation();

  return (
    <ChartContainer
      title={t("states.charts.title")}
      loading
      height={400}
      subtitle={undefined}
    />
  );
};

export default LoadingChartState;
