/* eslint-disable react/prop-types */
import { Box, Typography, Button, Divider, List } from "@mui/material";
import NotificationItem from "./notificationItem";
import EmptyNotifications from "./emptyNotifications";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: string;
  company?: any;
}

interface NotificationsListProps {
  filteredNotifications: Notification[];
  markAsRead: (id: string) => void;
  viewCompanyDetails: (company: any) => void;
  toggleReadStatus: (id: string, isRead: boolean) => void;
  clearNotification: (id: string) => void;
  getTimeAgo: (timestamp: string) => string;
  onClose: () => void;
}

const NotificationsList = ({
  filteredNotifications,
  markAsRead,
  viewCompanyDetails,
  toggleReadStatus,
  clearNotification,
  getTimeAgo,
  onClose,
}: NotificationsListProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  // Separate notifications into new and earlier
  const recentNotifications = filteredNotifications.slice(0, 3);
  const earlierNotifications = filteredNotifications.slice(3);

  if (filteredNotifications.length === 0) {
    return <EmptyNotifications />;
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflow: "auto",
      }}
    >
      {/* New Section Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.paper,
          position: "sticky",
          top: 0,
          zIndex: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          fontWeight="bold"
        >
          {t("new")}
        </Typography>
        <Button
          size="small"
          color="primary"
          sx={{ textTransform: "none", fontWeight: "normal" }}
          onClick={onClose}
        >
          {t("seeAll") || "See all"}
        </Button>
      </Box>

      {/* Recent notifications list */}
      <List sx={{ width: "100%", py: 0 }}>
        {recentNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            markAsRead={markAsRead}
            viewCompanyDetails={viewCompanyDetails}
            toggleReadStatus={toggleReadStatus}
            clearNotification={clearNotification}
            getTimeAgo={getTimeAgo}
          />
        ))}
      </List>

      {/* Earlier Section */}
      {earlierNotifications.length > 0 && (
        <>
          <Divider />
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: theme.palette.background.paper,
              borderBottom: "1px solid",
              borderColor: "divider",
              textAlign: isRtl ? "right" : "left",
            }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight="bold"
            >
              {t("earlier") || "Earlier"}
            </Typography>
          </Box>
          <List sx={{ width: "100%", py: 0 }}>
            {earlierNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markAsRead={markAsRead}
                viewCompanyDetails={viewCompanyDetails}
                toggleReadStatus={toggleReadStatus}
                clearNotification={clearNotification}
                getTimeAgo={getTimeAgo}
              />
            ))}
          </List>
        </>
      )}
    </Box>
  );
};

export default NotificationsList;
