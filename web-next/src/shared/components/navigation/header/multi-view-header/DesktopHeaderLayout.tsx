import { ArrowBack } from "@mui/icons-material";
import { Box, Chip, Divider, IconButton, Typography, useTheme } from "@mui/material";
import type { ComponentProps, ReactNode } from "react";
import type { Chip as MuiChip } from "@mui/material";
import HeaderActions from "./HeaderActions";
import type {
  HeaderActions as HeaderActionsConfig,
  HeaderExportOption,
  ViewOption,
  ViewType,
} from "./types";
import ViewToggle from "./ViewToggle";

type DesktopHeaderLayoutProps = {
  title: ReactNode;
  titleIcon?: ReactNode;
  showBackButton: boolean;
  onBack?: () => void;
  actions: HeaderActionsConfig;
  onAdd?: () => void;
  onRefresh: () => void;
  exportOptions: HeaderExportOption[];
  viewType: ViewType;
  viewOptions: ViewOption[];
  additionalChips: ComponentProps<typeof MuiChip>[];
  onViewChange: (event: React.MouseEvent<HTMLElement> | null, value: ViewType | null) => void;
};

export default function DesktopHeaderLayout(props: DesktopHeaderLayoutProps) {
  const theme = useTheme();
  const selectedLabel = props.viewOptions.find((option) => option.value === props.viewType)?.label ?? props.viewType;

  return (
    <Box sx={{ p: { xs: 2, md: 2.5, xl: 3 }, display: { xs: "none", md: "flex" }, justifyContent: "space-between", alignItems: "center", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {props.showBackButton && <IconButton onClick={props.onBack} size="small" sx={{ mr: 1 }}><ArrowBack /></IconButton>}
            {props.titleIcon && <Box sx={{ display: "flex", alignItems: "center" }}>{props.titleIcon}</Box>}
            <Typography variant="h5" sx={{ color: "text.primary", fontWeight: 600, whiteSpace: "nowrap" }}>{props.title}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: props.showBackButton ? 6 : props.titleIcon ? 4 : 0 }}>
            <Chip label={selectedLabel} size="small" color="secondary" sx={{ backgroundColor: `${theme.palette.secondary.main}20`, color: theme.palette.secondary.main }} />
            {props.additionalChips.map((chip, index) => <Chip key={index} {...chip} />)}
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <HeaderActions
            actions={props.actions}
            onAdd={props.onAdd}
            onRefresh={props.onRefresh}
            exportOptions={props.exportOptions}
          />
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ViewToggle value={props.viewType} options={props.viewOptions} showLabels onChange={props.onViewChange} />
      </Box>
    </Box>
  );
}
