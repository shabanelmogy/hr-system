import { LocationOn } from "@mui/icons-material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/feedback/states";
import { useTranslation } from "react-i18next";
import { EmptyStateProps } from "./AddressTypeCard.types";

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <ReusableEmptyState
      icon={LocationOn}
      title={t("addressTypes.noData")}
      subtitle={t("addressTypes.noDataDescription")}
      actionText={t("addressTypes.add")}
      onAction={onAdd}
    />
  );
};

export default EmptyState;
