import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

type NotificationBulkActionsProps = {
  unreadCount: number;
  totalCount: number;
  disabled: boolean;
  onMarkAllRead: () => void;
  onMarkAllUnread: () => void;
  onDismissAll: () => void;
};

export default function NotificationBulkActions(props: NotificationBulkActionsProps) {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr) 36px", gap: 1, bgcolor: "background.paper" }}>
      <Button
        size="small"
        startIcon={<DoneAllRoundedIcon />}
        disabled={props.unreadCount === 0 || props.disabled}
        onClick={props.onMarkAllRead}
        sx={{ minWidth: 0, whiteSpace: "normal", lineHeight: 1.2 }}
      >
        {t("notifications.markAllRead")}
      </Button>
      <Button
        size="small"
        color="inherit"
        startIcon={<MarkEmailUnreadOutlinedIcon />}
        disabled={props.totalCount === 0 || props.unreadCount >= props.totalCount || props.disabled}
        onClick={props.onMarkAllUnread}
        sx={{ minWidth: 0, whiteSpace: "normal", lineHeight: 1.2 }}
      >
        {t("notifications.markAllUnread")}
      </Button>
      <Tooltip title={t("notifications.dismissAll")}>
        <span>
          <IconButton
            size="small"
            color="error"
            disabled={props.totalCount === 0 || props.disabled}
            onClick={props.onDismissAll}
            aria-label={t("notifications.dismissAll")}
          >
            <DeleteSweepOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
