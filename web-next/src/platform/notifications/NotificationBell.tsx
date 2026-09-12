"use client";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import NotificationPopover from "./components/NotificationPopover";
import { useUnreadNotificationCount } from "./notificationQueries";

export function NotificationBell() {
  const { t } = useTranslation();
  const { user } = useSession();
  const isSuperAdmin = user?.roles?.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  );
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const unreadCount = useUnreadNotificationCount({ enabled: !isSuperAdmin }).data ?? 0;
  const open = Boolean(anchorEl);

  if (isSuperAdmin) {
    return null;
  }

  return (
    <>
      <Tooltip title={t("notifications.title")}>
        <IconButton
          color="inherit"
          aria-label={t("notifications.open", { count: unreadCount })}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          size="large"
        >
          <Badge badgeContent={unreadCount} color="error" max={99} invisible={unreadCount === 0}>
            <NotificationsNoneRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationPopover
        anchorEl={anchorEl}
        open={open}
        unreadCount={unreadCount}
        onClose={() => setAnchorEl(null)}
      />
    </>
  );
}
