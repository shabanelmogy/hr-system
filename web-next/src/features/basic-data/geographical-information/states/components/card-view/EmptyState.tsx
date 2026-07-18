import { LocationOn } from "@mui/icons-material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/feedback/states";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <ReusableEmptyState
      icon={LocationOn}
      title={t("states.noStatesAvailable")}
      subtitle={t("states.noStatesAvailableDescription")}
      actionText={t("states.addFirstState")}
      onAction={onAdd}
    />
  );
};

export default EmptyState;
