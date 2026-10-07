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
  // The app bar is primary in light mode and a surface in dark mode.
  const barText = theme.palette.mode === "light" ? theme.palette.primary.contrastText : theme.palette.text.primary;

  return (
    <FormControl variant="outlined" size="small">
      <InputLabel id={labelId} htmlFor={selectId} sx={{ color: barText, "&.Mui-focused": { color: barText } }}>
        {t("general.lang")}
      </InputLabel>
      <Select
        id={selectId}
        labelId={labelId}
        value={direction}
        onChange={(e) => handleLanguageChange(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
        label={t("general.lang")}
        sx={{ width: 125, color: barText, marginInlineEnd: 2, "& .MuiSvgIcon-root": { color: barText } }}
      >
        <MenuItem value="ltr">
          {t("common.english")}
        </MenuItem>
        <MenuItem value="rtl">
          {t("common.arabic")}
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
