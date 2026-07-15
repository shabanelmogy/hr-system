import { FilterList, Search, ViewModule } from "@mui/icons-material";
import {
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { ROLE_MODULES } from "./constants";

type RolePermissionsFiltersProps = {
  searchTerm: string;
  selectedModule: string;
  showOnlySelected: boolean;
  resultCount: number;
  onSearchChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  onShowOnlySelectedChange: (value: boolean) => void;
};

export default function RolePermissionsFilters(props: RolePermissionsFiltersProps) {
  return (
    <Grid container spacing={3} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          placeholder="Search modules..."
          value={props.searchTerm}
          onChange={(event) => props.onSearchChange(event.target.value)}
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by Module</InputLabel>
          <Select
            value={props.selectedModule}
            label="Filter by Module"
            onChange={(event) => props.onModuleChange(event.target.value)}
            startAdornment={<ViewModule sx={{ mr: 1, color: "action.active" }} />}
          >
            <MenuItem value=""><em>All Modules</em></MenuItem>
            {ROLE_MODULES.map((module) => (
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
          label="Show only selected"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 2 }}>
        <Chip
          icon={<FilterList />}
          label={`${props.resultCount} modules`}
          color="primary"
          variant="outlined"
        />
      </Grid>
    </Grid>
  );
}
