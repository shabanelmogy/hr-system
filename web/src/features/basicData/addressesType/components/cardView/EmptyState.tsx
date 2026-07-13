import { LocationOn } from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography
} from "@mui/material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/common/feedback";
import { useTranslation } from "react-i18next";
import { EmptyStateProps } from "./AddressTypeCard.types";

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
          {t("addressTypes.mainTitle")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("addressTypes.subTitle")}
        </Typography>
      </Paper>

      <ReusableEmptyState
        icon={LocationOn}
        title={t("addressTypes.noData")}
        subtitle={t("addressTypes.noDataDescription")}
        actionText={t("addressTypes.add")}
        onAction={onAdd}
        iconSize="large"
      />
    </Box>
  );
};

export default EmptyState;