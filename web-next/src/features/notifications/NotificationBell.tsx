"use client";

import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { Badge, IconButton, Tooltip } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import NotificationPopover from "./components/NotificationPopover";
import { useUnreadNotificationCount } from "./notificationQueries";

export function NotificationBell() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const unreadCount = useUnreadNotificationCount().data ?? 0;
  const open = Boolean(anchorEl);

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
