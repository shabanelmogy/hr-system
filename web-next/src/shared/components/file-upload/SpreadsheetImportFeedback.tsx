import { Alert, AlertTitle, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { SpreadsheetImportViewState } from "@/shared/services/excelService";

export interface SpreadsheetImportFeedbackProps {
  viewState: SpreadsheetImportViewState;
  message: string;
  onReconcile?: () => void;
}

export function SpreadsheetImportFeedback({
  viewState,
  message,
  onReconcile,
}: SpreadsheetImportFeedbackProps) {
  const { t } = useTranslation();

  if (!message || (viewState !== "failed" && viewState !== "uncertain")) {
    return null;
  }

  const uncertain = viewState === "uncertain";

  return (
    <Alert
      severity={uncertain ? "warning" : "error"}
      action={
        uncertain && onReconcile ? (
          <Button color="inherit" size="small" onClick={onReconcile}>
            {t("imports.reviewRecords")}
          </Button>
        ) : undefined
      }
      sx={{ mb: 2 }}
    >
      {uncertain && <AlertTitle>{t("imports.submissionUncertainTitle")}</AlertTitle>}
      {message}
    </Alert>
  );
}
