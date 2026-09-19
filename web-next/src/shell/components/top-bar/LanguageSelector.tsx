import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import { useId } from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = ({ direction, handleLanguageChange }: { direction: string; handleLanguageChange: (value: string) => void }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const labelId = useId();
  const selectId = useId();

  return (
    <FormControl variant="outlined" size="small">
      <InputLabel id={labelId} htmlFor={selectId} sx={{ color: "white" }}>
        {t("general.lang")}
      </InputLabel>
      <Select
        id={selectId}
        labelId={labelId}
        value={direction}
        onChange={(e) => handleLanguageChange(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
        label={t("general.lang")}
        sx={{ width: 125, color: "white", marginInlineEnd: 2 }}
      >
        <MenuItem
          value="ltr"
          sx={{
            color: theme.palette.mode === "dark" ? "white" : "black",
          }}
        >
          {t("common.english")}
        </MenuItem>
        <MenuItem
          value="rtl"
          sx={{
            color: theme.palette.mode === "dark" ? "white" : "black",
          }}
        >
          {t("common.arabic")}
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
