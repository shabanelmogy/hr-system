import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import {
  Button,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
} from "@mui/material";
import {
  GridPreferencePanelsValue,
  gridDensitySelector,
  type GridDensity,
  useGridApiContext,
  useGridRootProps,
  useGridSelector,
} from "@mui/x-data-grid";
import { useId, useState } from "react";

interface GridOptionsButtonProps {
  label: string;
}

const densityOptions: ReadonlyArray<{
  value: GridDensity;
  localeKey:
    | "toolbarDensityCompact"
    | "toolbarDensityStandard"
    | "toolbarDensityComfortable";
}> = [
  { value: "compact", localeKey: "toolbarDensityCompact" },
  { value: "standard", localeKey: "toolbarDensityStandard" },
  { value: "comfortable", localeKey: "toolbarDensityComfortable" },
];

export function GridOptionsButton({ label }: GridOptionsButtonProps) {
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const { localeText } = rootProps;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = `${buttonId}-menu`;
  const isOpen = Boolean(anchorEl);

  if (rootProps.disableColumnSelector && rootProps.disableDensitySelector) {
    return null;
  }

  const closeMenu = () => setAnchorEl(null);

  const openColumnsPanel = () => {
    closeMenu();
    apiRef.current.showPreferences(
      GridPreferencePanelsValue.columns,
      `${buttonId}-columns-panel`,
      buttonId,
    );
  };

  return (
    <>
      <Button
        id={buttonId}
        size="small"
        startIcon={<TuneOutlinedIcon />}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : undefined}
        aria-controls={isOpen ? menuId : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ marginInlineStart: "auto", flexShrink: 0 }}
      >
        {label}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={isOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {!rootProps.disableColumnSelector ? (
          <MenuItem onClick={openColumnsPanel}>
            <ListItemIcon>
              <ViewColumnOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={localeText.toolbarColumns} />
          </MenuItem>
        ) : null}
        {!rootProps.disableColumnSelector && !rootProps.disableDensitySelector ? (
          <Divider component="li" />
        ) : null}
        {!rootProps.disableDensitySelector ? (
          <MenuItem disabled>
            <ListItemText primary={localeText.toolbarDensity} />
          </MenuItem>
        ) : null}
        {!rootProps.disableDensitySelector
          ? densityOptions.map((option) => (
              <MenuItem
                key={option.value}
                selected={density === option.value}
                onClick={() => {
                  apiRef.current.setDensity(option.value);
                  closeMenu();
                }}
              >
                <ListItemIcon>
                  <Radio checked={density === option.value} size="small" />
                </ListItemIcon>
                <ListItemText primary={localeText[option.localeKey]} />
              </MenuItem>
            ))
          : null}
      </Menu>
    </>
  );
}
