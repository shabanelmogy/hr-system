import { MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { CountryStatus } from "../../types/Country";
import { ResetButton } from "@/shared/components/lists/card-view/header-controls/ResetButton";

interface CountryGridFiltersProps {
  status: CountryStatus;
  currencyCode: string;
  hasStates: "all" | "with" | "without";
  onStatusChange: (value: CountryStatus) => void;
  onCurrencyCodeChange: (value: string) => void;
  onHasStatesChange: (value: "all" | "with" | "without") => void;
  onReset: () => void;
}

const CountryGridFilters = ({
  status,
  currencyCode,
  hasStates,
  onStatusChange,
  onCurrencyCodeChange,
  onHasStatesChange,
  onReset,
}: CountryGridFiltersProps) => {
  const { t } = useTranslation();

  return (
    <>
      <TextField
        select
        size="small"
        label={t("countries.status.label")}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as CountryStatus)}
        sx={{ minWidth: 145 }}
      >
        <MenuItem value="active">{t("countries.status.active")}</MenuItem>
        <MenuItem value="archived">{t("countries.status.archived")}</MenuItem>
        <MenuItem value="all">{t("countries.status.all")}</MenuItem>
      </TextField>

      <TextField
        size="small"
        label={t("countries.currencyFilter")}
        value={currencyCode}
        onChange={(event) => onCurrencyCodeChange(event.target.value.toUpperCase())}
        error={currencyCode.length > 0 && currencyCode.length !== 3}
        slotProps={{ htmlInput: { maxLength: 3, inputMode: "text" } }}
        sx={{ width: 135 }}
      />

      <TextField
        select
        size="small"
        label={t("countries.statesFilter")}
        value={hasStates}
        onChange={(event) => onHasStatesChange(event.target.value as typeof hasStates)}
        sx={{ minWidth: 165 }}
      >
        <MenuItem value="all">{t("countries.statesFilterOptions.all")}</MenuItem>
        <MenuItem value="with">{t("countries.statesFilterOptions.with")}</MenuItem>
        <MenuItem value="without">{t("countries.statesFilterOptions.without")}</MenuItem>
      </TextField>

      <ResetButton onReset={onReset} fullWidth={false} />
    </>
  );
};

export default CountryGridFilters;
