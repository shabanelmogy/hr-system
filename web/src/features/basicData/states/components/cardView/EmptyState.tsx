import { LocationOn } from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography
} from "@mui/material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/common/feedback";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <Box>
      {/* Empty State Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
          {t("states.mainTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("states.mainSubTitle")}
        </Typography>
      </Paper>

      {/* Empty State Content using reusable component */}
      <ReusableEmptyState
        icon={LocationOn}
        title={t("states.noStatesAvailable")}
        subtitle={t("states.noStatesAvailableDescription")}
        actionText={t("states.addFirstState")}
        onAction={onAdd}
        iconSize="large"
      />
    </Box>
  );
};

export default EmptyState;