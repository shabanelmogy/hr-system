import { LocationCity } from "@mui/icons-material";
import { Box, Paper, Typography } from "@mui/material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/common/feedback";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
          {t("districts.mainTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("districts.mainSubTitle")}
        </Typography>
      </Paper>

      <ReusableEmptyState
        icon={LocationCity}
        title={t("districts.noDistrictsAvailable")}
        subtitle={t("districts.noDistrictsAvailableDescription")}
        actionText={t("districts.addFirstDistrict")}
        onAction={onAdd}
        iconSize="large"
      />
    </Box>
  );
};

export default EmptyState;
