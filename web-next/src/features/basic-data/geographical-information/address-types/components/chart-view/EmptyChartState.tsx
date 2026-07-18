import { BarChart } from "@mui/icons-material";
import { EmptyChartState as ReusableEmptyChartState } from "@/shared/components/feedback/states";
import type { EmptyChartStateProps } from "./AddressTypeChart.types";


const EmptyChartState = ({ t, onAdd }: EmptyChartStateProps) => {
  return (
    <ReusableEmptyChartState
      title={t("addressTypes.title")}
      message={t("addressTypes.noData")}
      subtitle={t("addressTypes.noDataDescription")}
      chartIcon={BarChart}
      emptyIcon={BarChart}
      actionText={onAdd ? t("addressTypes.add") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
