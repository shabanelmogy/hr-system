import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import ViewColumnOutlinedIcon from "@mui/icons-material/ViewColumnOutlined";
import {
  Button,
  Checkbox,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Radio,
} from "@mui/material";
import {
  gridColumnDefinitionsSelector,
  gridColumnVisibilityModelSelector,
  gridDensitySelector,
  type GridDensity,
  useGridApiContext,
  useGridRootProps,
  useGridSelector,
} from "@mui/x-data-grid";
import { useId, useState } from "react";
import { useDataGridShell } from "../core/context";

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
  const { gridOptionsContent } = useDataGridShell();
  const density = useGridSelector(apiRef, gridDensitySelector);
  const columns = useGridSelector(apiRef, gridColumnDefinitionsSelector);
  const columnVisibilityModel = useGridSelector(
    apiRef,
    gridColumnVisibilityModelSelector,
  );
  const { localeText } = rootProps;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [columnsAnchorEl, setColumnsAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const buttonId = useId();
  const menuId = `${buttonId}-menu`;
  const columnsMenuId = `${buttonId}-columns-menu`;
  const isOpen = Boolean(anchorEl);

  if (
    rootProps.disableColumnSelector &&
    rootProps.disableDensitySelector &&
    !gridOptionsContent
  ) {
    return null;
  }

  const closeMenu = () => {
    setColumnsAnchorEl(null);
    setAnchorEl(null);
  };

  const openColumnsMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setColumnsAnchorEl(event.currentTarget);
  };

  const visibleColumns = columns.filter(
    (column) => !column.field.startsWith("__"),
  );

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
          <MenuItem
            aria-haspopup="menu"
            aria-expanded={Boolean(columnsAnchorEl) ? "true" : undefined}
            aria-controls={Boolean(columnsAnchorEl) ? columnsMenuId : undefined}
            onClick={openColumnsMenu}
          >
            <ListItemIcon>
              <ViewColumnOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={localeText.toolbarColumns} />
            <ChevronRightIcon fontSize="small" />
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
        {gridOptionsContent ? (
          <>
            <Divider component="li" />
            {gridOptionsContent(closeMenu)}
          </>
        ) : null}
      </Menu>
      <Popover
        id={columnsMenuId}
        anchorEl={columnsAnchorEl}
        open={Boolean(columnsAnchorEl)}
        onClose={() => setColumnsAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: { maxHeight: 420, minWidth: 280, width: "max-content" },
          },
        }}
      >
        <List dense disablePadding>
          {visibleColumns.map((column) => {
            const isVisible = columnVisibilityModel[column.field] !== false;
            const isHideable = column.hideable !== false;

            return (
              <MenuItem
                key={column.field}
                disabled={!isHideable}
                onClick={() => {
                  if (isHideable) {
                    apiRef.current.setColumnVisibility(
                      column.field,
                      !isVisible,
                    );
                  }
                }}
              >
                <Checkbox
                  edge="start"
                  checked={isVisible}
                  disabled={!isHideable}
                  tabIndex={-1}
                  disableRipple
                  slotProps={{
                    input: {
                      "aria-label": `Toggle ${column.headerName ?? column.field}`,
                    },
                  }}
                />
                <ListItemText primary={column.headerName ?? column.field} />
              </MenuItem>
            );
          })}
        </List>
      </Popover>
    </>
  );
}
