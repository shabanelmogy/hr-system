import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import { Box, Skeleton, Tooltip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { NotificationFilter } from "../types";

export function ConnectionIndicator({
  connected,
  connecting,
}: {
  connected: boolean;
  connecting: boolean;
}) {
  const { t } = useTranslation();
  const title = connected
    ? t("notifications.liveConnected")
    : connecting
      ? t("notifications.liveConnecting")
      : t("notifications.liveDisconnected");

  return (
    <Tooltip title={title}>
      <Box
        component="span"
        aria-label={title}
        sx={{
          display: "grid",
          placeItems: "center",
          color: connected ? "success.main" : connecting ? "warning.main" : "text.disabled",
        }}
      >
        {connected ? (
          <WifiRoundedIcon fontSize="small" />
        ) : connecting ? (
          <SyncRoundedIcon fontSize="small" />
        ) : (
          <WifiOffRoundedIcon fontSize="small" />
        )}
      </Box>
    </Tooltip>
  );
}

export function NotificationEmptyState({ filter }: { filter: NotificationFilter }) {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 260,
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        px: 3,
        textAlign: "center",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 44, color: "text.disabled", mb: 1 }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {filter === "unread" ? t("notifications.noUnreadTitle") : t("notifications.emptyTitle")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {filter === "unread"
          ? t("notifications.noUnreadDescription")
          : t("notifications.emptyDescription")}
      </Typography>
    </Box>
  );
}

export function NotificationSkeleton() {
  return (
    <Box aria-busy="true">
      {[0, 1, 2, 3].map((item) => (
        <Box
          key={item}
          sx={{
            display: "flex",
            gap: 1.25,
            px: 2,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="48%" />
            <Skeleton width="88%" />
            <Skeleton width="32%" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
