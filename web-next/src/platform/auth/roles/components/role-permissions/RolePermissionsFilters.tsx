import FilterAltOffRoundedIcon from "@mui/icons-material/FilterAltOffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { MyTextField } from "@/shared/components/forms";
import { getPermissionResourceLabel } from "../../utils/permissionLabels";

type RolePermissionsFiltersProps = {
  modules: string[];
  searchTerm: string;
  selectedModule: string;
  showOnlySelected: boolean;
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onShowOnlySelectedChange: (value: boolean) => void;
  onReset: () => void;
};

export default function RolePermissionsFilters(props: RolePermissionsFiltersProps) {
  const { t } = useTranslation();
  const hasActiveFilters = Boolean(
    props.searchTerm || props.selectedModule || props.showOnlySelected,
  );

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 800 }}>
            {t("roles.permissionGroups")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("roles.groupsVisible", { visible: props.resultCount, total: props.totalCount })}
          </Typography>
        </Box>
        <Button
          size="small"
          startIcon={<FilterAltOffRoundedIcon />}
          onClick={props.onReset}
          disabled={!hasActiveFilters}
        >
          {t("roles.clearFilters")}
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(260px, 1.5fr) minmax(210px, 1fr) minmax(250px, 1fr)",
          },
          gap: 1.5,
          alignItems: "center",
        }}
      >
        <MyTextField
          counter={false}
          fieldName="rolePermissionsSearch"
          labelKey={null}
          margin="none"
          maxValue={100}
          placeholder={t("roles.searchPermissions")}
          value={props.searchTerm}
          onChange={(event) => props.onSearchChange(event.target.value)}
          showClearButton
          size="small"
          startIcon={<SearchRoundedIcon color="action" />}
        />

        <FormControl fullWidth size="small">
          <InputLabel>{t("roles.filterByGroup")}</InputLabel>
          <Select
            value={props.selectedModule}
            label={t("roles.filterByGroup")}
            onChange={(event) => props.onModuleChange(event.target.value)}
            startAdornment={
              <ViewModuleRoundedIcon
                sx={{ marginInlineEnd: 1, color: "action.active" }}
              />
            }
          >
            <MenuItem value="">
              <em>{t("roles.allGroups")}</em>
            </MenuItem>
            {props.modules.map((module) => (
              <MenuItem key={module} value={module}>
                {getPermissionResourceLabel(module, t)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={props.showOnlySelected ? "selected" : "all"}
          onChange={(_, value: "all" | "selected" | null) => {
            if (value) props.onShowOnlySelectedChange(value === "selected");
          }}
          aria-label={t("roles.selectionFilter")}
        >
          <ToggleButton value="all">{t("roles.allPermissions")}</ToggleButton>
          <ToggleButton value="selected">{t("roles.selectedOnly")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Stack>
  );
}
