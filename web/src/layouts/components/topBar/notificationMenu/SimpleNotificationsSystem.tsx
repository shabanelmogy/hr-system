/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { useState, forwardRef, useImperativeHandle } from "react";
import { IconButton, Badge, useTheme } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useTranslation } from "react-i18next";
import NotificationsMenu from "./notificationsMenu";
import useSimpleNotifications from "../../../../shared/hooks/useSimpleNotifications";

interface SimpleNotificationsSystemProps {
  isMobile?: boolean;
}

const SimpleNotificationsSystem = forwardRef<any, SimpleNotificationsSystemProps>((props, ref) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const { isMobile = false } = props;

  const {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toggleReadStatus,
    getStats
  } = useSimpleNotifications();

  const handleViewCompanyDetails = (company: any) => {
    // Handle company details view - placeholder implementation
    console.log('View company details:', company);
  };

  const handleMarkAllAsUnread = () => {
    // Placeholder implementation for mark all as unread
    console.log('Mark all as unread - not implemented in hook');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    handleMenuClose();
  };

  const handleClearAll = () => {
    clearAll();
    handleMenuClose();
  };

  // Expose minimal UI-focused methods
  useImperativeHandle(ref, () => ({
    // Core notification methods (for direct UI interactions)
    addNotification,
    getUnreadCount: () => unreadCount,
    
    // Filtering methods (for UI display)
    getNotificationsByCategory: (category: string) => notifications.filter(n => n.category === category),
    getNotificationsByType: (type: string) => notifications.filter(n => n.type === type),
    
    // Statistics (for UI analytics)
    getNotificationStats: getStats,
  }));

  return (
    <>
      <IconButton
        size="large"
        aria-label={t("notifications") || "Notifications"}
        color="inherit"
        onClick={handleMenuOpen}
        sx={{
          "&:hover": { backgroundColor: theme.palette.action.hover },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <NotificationsMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        notifications={notifications}
        unreadCount={unreadCount}
        markAllAsRead={markAllAsRead}
        markAsRead={handleMarkAsRead}
        viewCompanyDetails={handleViewCompanyDetails}
        clearAllNotifications={handleClearAll}
        isMobile={isMobile}
        toggleReadStatus={toggleReadStatus}
        clearNotification={removeNotification}
        markAllAsUnread={handleMarkAllAsUnread}
      />
    </>
  );
});

export default SimpleNotificationsSystem;