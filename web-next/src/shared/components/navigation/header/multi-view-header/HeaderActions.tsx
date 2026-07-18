import {
  Add,
  Description,
  FilterAlt,
  PictureAsPdf,
  Print,
  Refresh,
  SaveAlt,
  TableView,
} from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  HeaderActions as HeaderActionsConfig,
  HeaderExportOption,
} from "./types";

type HeaderActionsProps = {
  actions: HeaderActionsConfig;
  compact?: boolean;
  iconOnlyAdd?: boolean;
  onAdd?: () => void;
  onRefresh: () => void;
  onFilter?: () => void;
  exportOptions: HeaderExportOption[];
};

function exportIcon(format: HeaderExportOption["format"]) {
  switch (format) {
    case "excel":
      return <TableView fontSize="small" color="success" />;
    case "pdf":
      return <PictureAsPdf fontSize="small" color="error" />;
    case "csv":
      return <Description fontSize="small" color="info" />;
    case "print":
      return <Print fontSize="small" />;
    default:
      return <SaveAlt fontSize="small" />;
  }
}

export default function HeaderActions(props: HeaderActionsProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const exportMenuId = useId();
  const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);
  const isExporting = props.exportOptions.some((option) => option.loading);
  const hasAvailableExport = props.exportOptions.some((option) => !option.disabled);

  const handleExport = (option: HeaderExportOption) => {
    setExportAnchor(null);
    void option.onSelect();
  };

  return (
    <>
      {props.actions.add && (
        <Tooltip title={t("actions.add") || "Add"} arrow>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={props.onAdd}
            size="small"
            aria-label={props.iconOnlyAdd ? t("actions.add") || "Add" : undefined}
            sx={{
              borderRadius: props.compact ? 2 : 3,
              textTransform: "none",
              fontWeight: 700,
              fontSize: props.compact ? { xs: "0.7rem", sm: "0.75rem" } : undefined,
              minWidth: props.compact ? "auto" : undefined,
              px: props.compact ? { xs: 1, sm: 1.25 } : 2,
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              transition: "transform 0.15s ease, box-shadow 0.15s ease, filter 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.31)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
              "&:active": { transform: "translateY(0)" },
              "& .MuiButton-startIcon": {
                marginInlineEnd: props.iconOnlyAdd ? 0 : props.compact ? 0.5 : 1,
                marginInlineStart: 0,
              },
            }}
          >
            {props.iconOnlyAdd ? "" : t("actions.add") || "Add"}
          </Button>
        </Tooltip>
      )}
      {props.actions.refresh && (
        <Tooltip title={t("navigation.refresh")} arrow>
          <IconButton
            size="small"
            onClick={props.onRefresh}
            aria-label={t("navigation.refresh")}
            sx={{
              backgroundColor: theme.palette.action.hover,
              width: props.compact ? 32 : undefined,
              height: props.compact ? 32 : undefined,
              "&:hover": { backgroundColor: theme.palette.action.selected },
            }}
          >
            <Refresh fontSize={props.compact ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      )}
      {props.actions.filter && props.onFilter && (
        <Tooltip title={t("navigation.filter")} arrow>
          <IconButton
            size="small"
            onClick={props.onFilter}
            aria-label={t("navigation.filter")}
            sx={{
              backgroundColor: theme.palette.action.hover,
              width: props.compact ? 32 : undefined,
              height: props.compact ? 32 : undefined,
              "&:hover": { backgroundColor: theme.palette.action.selected },
            }}
          >
            <FilterAlt fontSize={props.compact ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
      )}
      {props.actions.export && props.exportOptions.length > 0 && (
        <>
          <Tooltip title={t("actions.export") || "Export"} arrow>
            <span>
              <IconButton
                size="small"
                onClick={(event) => setExportAnchor(event.currentTarget)}
                disabled={isExporting || !hasAvailableExport}
                aria-label={t("actions.export") || "Export"}
                aria-controls={exportAnchor ? exportMenuId : undefined}
                aria-haspopup="menu"
                aria-expanded={exportAnchor ? "true" : undefined}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  width: props.compact ? 32 : undefined,
                  height: props.compact ? 32 : undefined,
                  "&:hover": { backgroundColor: theme.palette.action.selected },
                }}
              >
                {isExporting ? <CircularProgress size={18} /> : <SaveAlt fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
          <Menu
            id={exportMenuId}
            anchorEl={exportAnchor}
            open={Boolean(exportAnchor)}
            onClose={() => setExportAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: 210 } } }}
          >
            {props.exportOptions.map((option) => (
              <MenuItem
                key={option.id}
                disabled={option.disabled || option.loading}
                onClick={() => handleExport(option)}
              >
                <ListItemIcon>
                  {option.loading ? <CircularProgress size={18} /> : exportIcon(option.format)}
                </ListItemIcon>
                <ListItemText primary={option.label} />
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </>
  );
}
