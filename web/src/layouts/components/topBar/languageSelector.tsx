/* eslint-disable react/prop-types */
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const LanguageSelector = ({ direction, handleLanguageChange }: { direction: string; handleLanguageChange: (value: string) => void }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <FormControl variant="outlined" size="small">
      <InputLabel sx={{ color: "white" }}>{t("general.lang")}</InputLabel>
      <Select
        value={direction}
        onChange={(e) => handleLanguageChange(e.target.value)}
        MenuProps={{ disableScrollLock: true }}
        label={t("general.lang")}
        sx={{ width: 125, color: "white", mr: 2 }}
      >
        <MenuItem
          value="ltr"
          sx={{
            color: theme.palette.mode === "dark" ? "white" : "black",
          }}
        >
          English
        </MenuItem>
        <MenuItem
          value="rtl"
          sx={{
            color: theme.palette.mode === "dark" ? "white" : "black",
          }}
        >
          العربية
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
