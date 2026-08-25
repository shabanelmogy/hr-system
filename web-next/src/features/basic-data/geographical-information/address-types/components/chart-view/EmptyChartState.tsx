import { EmptyChartState as ReusableEmptyChartState } from "@/shared/components/feedback/states";
import { LocationOn } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import type { EmptyChartStateProps } from "./AddressTypeChart.types";


const EmptyChartState = ({ onAdd }: EmptyChartStateProps) => {
  const { t } = useTranslation();

  return (
    <ReusableEmptyChartState
      title={t("addressTypes.charts.title")}
      message={t("addressTypes.charts.noData")}
      subtitle={t("addressTypes.noDataDescription")}
      chartIcon={LocationOn}
      emptyIcon={LocationOn}
      actionText={onAdd ? t("addressTypes.add") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
