/* eslint-disable react/prop-types */
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const MySelectSearchType = ({
  searchType,
  handleSearchTypeChange,
  loading,
}) => {
  const { t } = useTranslation();

  return (
    <FormControl sx={{ width: "100%" }}>
      <InputLabel>{t("searchType")}</InputLabel>
      <Select
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
