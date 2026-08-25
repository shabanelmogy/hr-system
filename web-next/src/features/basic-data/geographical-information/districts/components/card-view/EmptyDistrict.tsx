import { LocationOn } from "@mui/icons-material";
import { EmptyState as ReusableEmptyDistrict } from "@/shared/components/feedback/states";
import { useTranslation } from "react-i18next";

interface EmptyDistrictProps {
  onAdd?: () => void;
}

const EmptyDistrict = ({ onAdd }: EmptyDistrictProps) => {
  const {t} = useTranslation();

  return (
    <ReusableEmptyDistrict
      icon={LocationOn}
      title={t("districts.noDistrictsAvailable")}
      subtitle={t("districts.noDistrictsAvailableDescription")}
      actionText={onAdd ? t("districts.addFirstState") : undefined}
      onAction={onAdd}
    />
  );
};

export default EmptyDistrict;
