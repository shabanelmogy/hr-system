/* eslint-disable react/prop-types */
import React from "react";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import MarkEmailUnreadIcon from "@mui/icons-material/MarkEmailUnread";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import { useTheme } from "@mui/material";

interface NotificationItemProps {
  notification: {
    id: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    type: string;
    company?: any;
  };
  markAsRead: (id: string) => void;
  viewCompanyDetails: (company: any) => void;
  toggleReadStatus: (id: string, isRead: boolean) => void;
  clearNotification: (id: string) => void;
  getTimeAgo: (timestamp: string) => string;
}

const NotificationItem = ({
  notification,
  markAsRead,
  viewCompanyDetails,
  toggleReadStatus,
  clearNotification,
  getTimeAgo,
}: NotificationItemProps) => {
  const theme = useTheme();
 
  // Handle toggle read status with stopPropagation
  const handleToggleReadStatus = (event: React.MouseEvent, notificationId: string, isRead: boolean) => {
    event.stopPropagation();
    toggleReadStatus(notificationId, isRead);
  };

  // Handle clearing a notification with stopPropagation
  const handleClearNotification = (event: React.MouseEvent, notificationId: string) => {
    event.stopPropagation();
    clearNotification(notificationId);
  };

  // Handle click on the main notification
  const handleNotificationClick = () => {
    if (notification.company) {
      viewCompanyDetails(notification.company);
    }
    markAsRead(notification.id);
  };

  return (
    <Box
      sx={{
        mb: 1,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
        boxShadow: 1,
        overflow: "hidden",
      }}
    >
      <ListItem
        alignItems="flex-start"
        onClick={handleNotificationClick}
        sx={{
          py: 1.5,
          px: 2,
          "&:hover": {
            bgcolor: "action.hover",
            cursor: "pointer",
          },
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left side - Avatar and content */}
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: notification.isRead ? "grey.400" : "primary.main",
              }}
            >
              {notification.type === "company" ? (
                <BusinessIcon />
              ) : (
                <CheckCircleIcon />
              )}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                component="div"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {notification.message}
              </Typography>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 0.5
                }}>
                {getTimeAgo(notification.timestamp)}
              </Typography>
            }
          />
        </Box>

        {/* Right side - Action buttons and unread indicator */}
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            display: "flex",
            alignItems: "center",
            ml: 1,
            flexShrink: 0,
          }}
        >
          {!notification.isRead && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "primary.main",
                mr: 1,
              }}
            />
          )}

          {/* Divider between content and buttons */}
          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Action buttons - always visible */}
          <Tooltip title="Mark as read/unread" arrow placement="bottom">
            <IconButton
              size="small"
              onClick={(e) =>
                handleToggleReadStatus(e, notification.id, notification.isRead)
              }
              sx={{
                color: theme.palette.primary.main,
                mx: 0.5,
              }}
            >
              {notification.isRead ? (
                <MarkEmailUnreadIcon fontSize="small" />
              ) : (
                <MarkEmailReadIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear notification" arrow placement="bottom">
            <IconButton
              size="small"
              onClick={(e) => handleClearNotification(e, notification.id)}
              sx={{
                color: theme.palette.error.main,
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </ListItem>
    </Box>
  );
};

export default NotificationItem;
