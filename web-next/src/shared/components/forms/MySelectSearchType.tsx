import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";

type SearchType =
  | "contains"
  | "notcontains"
  | "startswith"
  | "notstartswith"
  | "endswith"
  | "notendswith"
  | "equal"
  | "notEqual";

interface MySelectSearchTypeProps {
  searchType: SearchType;
  handleSearchTypeChange: (event: SelectChangeEvent<SearchType>) => void;
  loading?: boolean;
}

const MySelectSearchType = ({
  searchType,
  handleSearchTypeChange,
  loading = false,
}: MySelectSearchTypeProps) => {
  const { t } = useTranslation();

  return (
    <FormControl fullWidth>
      <InputLabel>{t("searchType")}</InputLabel>
      <Select<SearchType>
        MenuProps={{ disableScrollLock: true }}
        value={searchType}
        label={t("searchType")}
        onChange={handleSearchTypeChange}
        disabled={loading}
      >
        <MenuItem value="contains">{t("contains")}</MenuItem>
        <MenuItem value="notcontains">{t("notContains")}</MenuItem>
        <MenuItem value="startswith">{t("startsWith")}</MenuItem>
        <MenuItem value="notstartswith">{t("notStartsWith")}</MenuItem>
        <MenuItem value="endswith">{t("endsWith")}</MenuItem>
        <MenuItem value="notendswith">{t("notEndsWith")}</MenuItem>
        <MenuItem value="equal">{t("equals")}</MenuItem>
        <MenuItem value="notEqual">{t("notEquals")}</MenuItem>
      </Select>
    </FormControl>
  );
};

export default MySelectSearchType;
