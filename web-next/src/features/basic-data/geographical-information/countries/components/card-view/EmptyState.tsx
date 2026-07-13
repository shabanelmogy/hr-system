import { Public } from "@mui/icons-material";
import {
  Box,
  Paper,
  Typography
} from "@mui/material";
import { EmptyState as ReusableEmptyState } from "@/shared/components/feedback";
import { useTranslation } from "react-i18next";

interface EmptyStateProps {
  onAdd: () => void;
}

const EmptyState = ({ onAdd }: EmptyStateProps) => {
  const {t} = useTranslation();

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: "primary.main",
            fontWeight: "bold"
          }}>
          {t("countries.mainTitle")}
        </Typography>
        <Typography variant="body1" sx={{
          color: "text.secondary"
        }}>
          {t("countries.mainSubTitle")}
        </Typography>
      </Paper>
      <ReusableEmptyState
        icon={Public}
        title={t("countries.noCountriesAvailable")}
        subtitle={t("countries.noCountriesAvailableDescription")}
        actionText={t("countries.addFirstCountry")}
        onAction={onAdd}
        iconSize="large"
      />
    </Box>
  );
};

export default EmptyState;