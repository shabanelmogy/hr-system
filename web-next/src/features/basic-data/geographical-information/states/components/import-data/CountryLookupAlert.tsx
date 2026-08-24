import { Alert, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CountryLookupState } from "./stateImport";

interface CountryLookupAlertProps {
  state: CountryLookupState;
  onRetry: () => void;
}

export function CountryLookupAlert({ state, onRetry }: CountryLookupAlertProps) {
  const { t } = useTranslation();

  if (state === "ready") return null;

  return (
    <Alert
      severity={state === "loading" ? "info" : state === "empty" ? "warning" : "error"}
      action={
        state === "error" ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            {t("imports.retryLookup")}
          </Button>
        ) : undefined
      }
      aria-live="polite"
      sx={{ mb: 2 }}
    >
      {t(`states.import.countryLookup.${state}`)}
    </Alert>
  );
}
