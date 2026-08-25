import { ChartContainer } from "@/shared/components/charts";
import { useTranslation } from "react-i18next";

const LoadingChartState = () => {
  const { t } = useTranslation();

  return (
    <ChartContainer
      title={t("addressTypes.charts.title")}
      loading
      height={200}
      compact
      subtitle={undefined}
    />
  );
};

export default LoadingChartState;
