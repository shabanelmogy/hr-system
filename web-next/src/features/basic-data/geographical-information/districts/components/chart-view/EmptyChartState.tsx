import { BarChart } from "@mui/icons-material";
import { EmptyChartState as ReusableEmptyChartState } from "@/shared/components/feedback/states";

interface EmptyChartStateProps {
  t: (key: string) => string;
  onAdd?: () => void;
}

const EmptyChartState = ({ t, onAdd }: EmptyChartStateProps) => {
  return (
    <ReusableEmptyChartState
      title={t("districts.charts.title")}
      message={t("districts.noData")}
      subtitle={t("districts.noDataDescription")}
      chartIcon={BarChart}
      emptyIcon={BarChart}
      actionText={onAdd ? t("districts.add") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
