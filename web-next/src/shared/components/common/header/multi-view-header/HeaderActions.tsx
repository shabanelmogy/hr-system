import { Add, Refresh } from "@mui/icons-material";
import { Button, IconButton, Tooltip, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { HeaderActions as HeaderActionsConfig } from "./types";

type HeaderActionsProps = {
  actions: HeaderActionsConfig;
  compact?: boolean;
  iconOnlyAdd?: boolean;
  onAdd?: () => void;
  onRefresh: () => void;
};

export default function HeaderActions(props: HeaderActionsProps) {
  const { t } = useTranslation();
  const theme = useTheme();

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
              boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: theme.palette.primary.contrastText,
              transition: "transform 0.15s ease, box-shadow 0.15s ease, filter 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: `0 6px 16px ${theme.palette.primary.main}50`,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
              "&:active": { transform: "translateY(0)" },
              "& .MuiButton-startIcon": { mr: props.iconOnlyAdd ? 0 : props.compact ? 0.5 : 1 },
            }}
          >
            {props.iconOnlyAdd ? "" : t("actions.add") || "Add"}
          </Button>
        </Tooltip>
      )}
      {props.actions.refresh && (
        <Tooltip title={t("actions.refresh") || "Refresh"} arrow>
          <IconButton
            size="small"
            onClick={props.onRefresh}
            aria-label={t("actions.refresh") || "Refresh"}
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
    </>
  );
}
