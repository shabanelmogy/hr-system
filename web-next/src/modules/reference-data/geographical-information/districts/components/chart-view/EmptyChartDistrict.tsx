import { EmptyChartState as ReusableEmptyChartState } from "@/shared/components/feedback/states";
import { LocationOn } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface EmptyChartStateProps {
  onAdd?: () => void;
}

const EmptyChartState = ({ onAdd }: EmptyChartStateProps) => {
  const { t } = useTranslation();

  return (
    <ReusableEmptyChartState
      title={t("districts.charts.title")}
      message={t("districts.charts.noData")}
      subtitle={t("districts.noDataDescription")}
      chartIcon={LocationOn}
      emptyIcon={LocationOn}
      actionText={onAdd ? t("districts.addFirstState") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
