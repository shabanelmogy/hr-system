import React from "react";
import { Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface NoDataMessageProps {
  show: boolean;
}

const NoDataMessage: React.FC<NoDataMessageProps> = ({ show }) => {
  const { t } = useTranslation();

  if (!show) return null;

  return (
    <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: "center", mt: 3 }}>
      <Typography
        color="text.secondary"
        variant="h6"
        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
      >
        {t("imports.noDataAvailable") || "No data available"}
      </Typography>
      <Typography
        color="text.secondary"
        variant="body2"
        sx={{ mt: 1, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
      >
        {t("imports.startExcelUpload") || "Start by uploading an Excel file (.xlsx)"}
      </Typography>
    </Paper>
  );
};

export default NoDataMessage;
