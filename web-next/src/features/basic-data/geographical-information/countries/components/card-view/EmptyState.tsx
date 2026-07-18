import { Public } from "@mui/icons-material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/feedback/states";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <ReusableEmptyState
      icon={Public}
      title={t("countries.noCountriesAvailable")}
      subtitle={t("countries.noCountriesAvailableDescription")}
      actionText={t("countries.addFirstCountry")}
      onAction={onAdd}
    />
  );
};

export default EmptyState;
