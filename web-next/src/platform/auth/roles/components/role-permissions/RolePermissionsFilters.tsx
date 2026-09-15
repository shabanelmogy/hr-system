import { FilterList, Search, ViewModule } from "@mui/icons-material";
import {
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { MyTextField } from "@/shared/components/forms";
import { useTranslation } from "react-i18next";

type RolePermissionsFiltersProps = {
  modules: string[];
  searchTerm: string;
  selectedModule: string;
  showOnlySelected: boolean;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onShowOnlySelectedChange: (value: boolean) => void;
};

export default function RolePermissionsFilters(props: RolePermissionsFiltersProps) {
  const { t } = useTranslation();
  return (
    <Grid container spacing={3} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <MyTextField
          counter={false}
          fieldName="rolePermissionsSearch"
          labelKey={null}
          margin="none"
          maxValue={100}
          placeholder={t("roles.searchModules")}
          value={props.searchTerm}
          onChange={(event) => props.onSearchChange(event.target.value)}
          showClearButton
          size="small"
          startIcon={<Search color="action" />}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>{t("roles.filterByModule")}</InputLabel>
          <Select
            value={props.selectedModule}
            label={t("roles.filterByModule")}
            onChange={(event) => props.onModuleChange(event.target.value)}
            startAdornment={<ViewModule sx={{ mr: 1, color: "action.active" }} />}
          >
            <MenuItem value=""><em>{t("roles.allModules")}</em></MenuItem>
            {props.modules.map((module) => (
              <MenuItem key={module} value={module}>{module}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={props.showOnlySelected}
              onChange={(event) => props.onShowOnlySelectedChange(event.target.checked)}
            />
          }
          label={t("roles.showOnlySelected")}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <Chip
          icon={<FilterList />}
          label={t("roles.moduleCount", { count: props.resultCount })}
          color="primary"
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
}
