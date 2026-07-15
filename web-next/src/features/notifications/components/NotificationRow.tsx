import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  alpha,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  formatRelativeTime,
  isSafeAppUrl,
  normalizeSeverity,
  translateNotification,
  type NormalizedNotificationSeverity,
} from "../notificationPresentation";
import type { AppNotification } from "../types";

type NotificationRowProps = {
  notification: AppNotification;
  locale: string;
  onOpen: () => void;
  onMarkRead: () => void;
  onMarkUnread: () => void;
  onDismiss: () => void;
  markingRead: boolean;
  markingUnread: boolean;
  dismissing: boolean;
};

export default function NotificationRow(props: NotificationRowProps) {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const content = translateNotification(props.notification, t);
  const unread = !props.notification.readOn;
  const busy = props.markingRead || props.markingUnread || props.dismissing;

  return (
    <Box
      sx={{
        position: "relative",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: unread ? (theme) => alpha(theme.palette.primary.main, 0.06) : "transparent",
        "&::before": {
          content: '""',
          position: "absolute",
          insetBlock: 0,
          insetInlineStart: 0,
          width: 3,
          bgcolor: unread ? "primary.main" : "transparent",
        },
      }}
    >
      <ListItemButton
        onClick={props.onOpen}
        disabled={busy}
        alignItems="flex-start"
        sx={{ gap: 1.25, px: 2, py: 1.5, paddingInlineEnd: 6.5 }}
      >
        <SeverityIcon severity={normalizeSeverity(props.notification.severity)} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography
              variant="body2"
              sx={{ minWidth: 0, flex: 1, fontWeight: unread ? 800 : 650, overflowWrap: "anywhere" }}
            >
              {content.title}
            </Typography>
            {unread && (
              <Box
                aria-label={t("notifications.unreadIndicator")}
                sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "primary.main" }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35, lineHeight: 1.5, overflowWrap: "anywhere" }}>
            {content.message}
          </Typography>
          <Box sx={{ mt: 0.85, display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(props.notification.createdOn, props.locale)}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {props.notification.category}
            </Typography>
          </Box>
        </Box>
      </ListItemButton>

      <Tooltip title={t("notifications.moreActions")}>
        <IconButton
          size="small"
          aria-label={t("notifications.moreActions")}
          onClick={(event) => {
            event.stopPropagation();
            setMenuAnchor(event.currentTarget);
          }}
          sx={{ position: "absolute", top: 10, insetInlineEnd: 8 }}
        >
          {busy ? <CircularProgress size={18} /> : <MoreVertRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 190, borderRadius: 1.5, backgroundImage: "none" } } }}
      >
        {isSafeAppUrl(props.notification.actionUrl) && (
          <MenuItem onClick={() => { setMenuAnchor(null); props.onOpen(); }}>
            <ListItemIcon><OpenInNewRoundedIcon fontSize="small" /></ListItemIcon>
            {t("notifications.openItem")}
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            if (unread) props.onMarkRead();
            else props.onMarkUnread();
          }}
        >
          <ListItemIcon>
            {unread
              ? <MarkEmailReadOutlinedIcon fontSize="small" />
              : <MarkEmailUnreadOutlinedIcon fontSize="small" />}
          </ListItemIcon>
          {unread ? t("notifications.markRead") : t("notifications.markUnread")}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setMenuAnchor(null); props.onDismiss(); }} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}><DeleteOutlineRoundedIcon fontSize="small" /></ListItemIcon>
          {t("notifications.dismiss")}
        </MenuItem>
      </Menu>
    </Box>
  );
}

function SeverityIcon({ severity }: { severity: NormalizedNotificationSeverity }) {
  const details: Record<
    NormalizedNotificationSeverity,
    { icon: ReactNode; color: keyof Theme["palette"] }
  > = {
    info: { icon: <InfoOutlinedIcon fontSize="small" />, color: "info" },
    success: { icon: <CheckCircleOutlineRoundedIcon fontSize="small" />, color: "success" },
    warning: { icon: <WarningAmberRoundedIcon fontSize="small" />, color: "warning" },
    critical: { icon: <ErrorOutlineRoundedIcon fontSize="small" />, color: "error" },
  };
  const detail = details[severity];

  return (
    <Box
      sx={(theme) => {
        const palette = theme.palette[detail.color] as { main: string };
        return {
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: palette.main,
          bgcolor: alpha(palette.main, 0.12),
        };
      }}
    >
      {detail.icon}
    </Box>
  );
}
