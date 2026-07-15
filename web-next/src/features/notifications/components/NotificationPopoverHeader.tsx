import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { alpha, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ConnectionIndicator } from "./NotificationStatus";

type NotificationPopoverHeaderProps = {
  unreadCount: number;
  totalCount: number;
  connected: boolean;
  connecting: boolean;
  onClose: () => void;
};

export default function NotificationPopoverHeader(props: NotificationPopoverHeaderProps) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ width: 38, height: 38, borderRadius: 1.5, display: "grid", placeItems: "center", color: "primary.main", bgcolor: (theme) => alpha(theme.palette.primary.main, 0.13) }}>
        <NotificationsNoneRoundedIcon />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{t("notifications.title")}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t("notifications.summary", { unread: props.unreadCount, total: props.totalCount })}
        </Typography>
      </Box>
      <ConnectionIndicator connected={props.connected} connecting={props.connecting} />
      <Tooltip title={t("general.close", { defaultValue: "Close" })}>
        <IconButton size="small" onClick={props.onClose} aria-label={t("general.close")}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
