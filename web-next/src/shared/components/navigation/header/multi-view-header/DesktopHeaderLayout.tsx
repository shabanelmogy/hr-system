import { Box, Chip, Divider, Typography, useTheme } from "@mui/material";
import type { Chip as MuiChip } from "@mui/material";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import BackButton from "@/shared/components/navigation/BackButton";
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
  onFilter?: () => void;
  exportOptions: HeaderExportOption[];
  viewType: ViewType;
  viewOptions: ViewOption[];
  additionalChips: ComponentProps<typeof MuiChip>[];
  onViewChange: (
    event: MouseEvent<HTMLElement> | null,
    value: ViewType | null,
  ) => void;
};

export default function DesktopHeaderLayout(props: DesktopHeaderLayoutProps) {
  const theme = useTheme();
  const selectedLabel =
    props.viewOptions.find((option) => option.value === props.viewType)?.label ??
    props.viewType;
  const titleOffset = props.showBackButton ? 6 : props.titleIcon ? 4 : 0;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5, xl: 3 },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {props.showBackButton && props.onBack ? (
              <BackButton onClick={props.onBack} size="small" />
            ) : null}
            {props.titleIcon ? (
              <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                {props.titleIcon}
              </Box>
            ) : null}
            <Typography
              component="h1"
              variant="h5"
              sx={{
                color: "text.primary",
                fontWeight: 600,
                minWidth: 0,
                overflowWrap: "anywhere",
              }}
            >
              {props.title}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              marginInlineStart: titleOffset,
            }}
          >
            <Chip
              label={selectedLabel}
              size="small"
              color="secondary"
              sx={{
                backgroundColor: `${theme.palette.secondary.main}20`,
                color: theme.palette.secondary.main,
              }}
            />
            {props.additionalChips.map((chip, index) => (
              <Chip key={index} {...chip} />
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          minWidth: 0,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
          <HeaderActions
            actions={props.actions}
            onAdd={props.onAdd}
            onRefresh={props.onRefresh}
            onFilter={props.onFilter}
            exportOptions={props.exportOptions}
          />
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        <ViewToggle
          value={props.viewType}
          options={props.viewOptions}
          showLabels
          onChange={props.onViewChange}
        />
      </Box>
    </Box>
  );
}
