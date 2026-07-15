import { ArrowBack, MoreVert } from "@mui/icons-material";
import { Box, Chip, IconButton, Menu, MenuItem, Typography, useTheme } from "@mui/material";
import { useState, type ComponentProps, type ReactNode } from "react";
import type { Chip as MuiChip } from "@mui/material";
import HeaderActions from "./HeaderActions";
import type { HeaderActions as HeaderActionsConfig, ViewOption, ViewType } from "./types";
import ViewToggle from "./ViewToggle";

type MobileHeaderLayoutProps = {
  title: ReactNode;
  titleIcon?: ReactNode;
  showBackButton: boolean;
  onBack?: () => void;
  actions: HeaderActionsConfig;
  onAdd?: () => void;
  onRefresh: () => void;
  viewType: ViewType;
  viewOptions: ViewOption[];
  isXs: boolean;
  dataCount: number;
  totalLabel: string;
  additionalChips: ComponentProps<typeof MuiChip>[];
  onViewChange: (event: React.MouseEvent<HTMLElement> | null, value: ViewType | null) => void;
};

export default function MobileHeaderLayout(props: MobileHeaderLayoutProps) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const visibleOptions = props.isXs ? props.viewOptions.slice(0, 2) : props.viewOptions;
  const overflowOptions = props.isXs ? props.viewOptions.slice(2) : [];
  const selectedLabel = props.viewOptions.find((option) => option.value === props.viewType)?.label ?? props.viewType;

  return (
    <Box sx={{ p: 2, display: { xs: "block", md: "none" } }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1, position: "relative" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          {props.showBackButton && <IconButton onClick={props.onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>}
          {props.titleIcon && <Box sx={{ display: "flex", alignItems: "center" }}>{props.titleIcon}</Box>}
          <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, fontSize: "1.1rem", overflowWrap: "anywhere" }}>{props.title}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mx: 1 }}>
          <HeaderActions actions={props.actions} compact iconOnlyAdd={props.isXs} onAdd={props.onAdd} onRefresh={props.onRefresh} />
        </Box>
        <Box sx={{ display: "flex", flexShrink: 0 }}>
          <ViewToggle value={props.viewType} options={visibleOptions} compact onChange={props.onViewChange} />
          {overflowOptions.length > 0 && (
            <IconButton size="small" aria-label="More views" onClick={(event) => setMenuAnchor(event.currentTarget)}>
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 2, ml: props.showBackButton ? 6 : props.titleIcon ? 4 : 0 }}>
        <Chip label={`${props.dataCount} ${props.totalLabel}`} size="small" color="primary" variant="outlined" />
        <Chip label={selectedLabel} size="small" color="secondary" sx={{ backgroundColor: `${theme.palette.secondary.main}20`, color: theme.palette.secondary.main }} />
        {props.additionalChips.map((chip, index) => <Chip key={index} {...chip} />)}
      </Box>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        {overflowOptions.map((option) => (
          <MenuItem key={option.value} onClick={() => { props.onViewChange(null, option.value); setMenuAnchor(null); }}>
            {option.icon}<Box sx={{ ml: 1 }}>{option.label}</Box>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
