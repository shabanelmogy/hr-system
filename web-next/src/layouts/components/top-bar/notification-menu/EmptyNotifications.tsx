import { Box, Avatar, Typography } from "@mui/material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { useTranslation } from "react-i18next";

const EmptyNotifications = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "250px",
        p: 3,
      }}
    >
      <Avatar
        sx={{
          bgcolor: "action.disabledBackground",
          mb: 2,
          width: 60,
          height: 60,
        }}
      >
        <NotificationsNoneOutlinedIcon
          sx={{ fontSize: 30, color: "text.secondary" }}
        />
      </Avatar>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          textAlign: "center",
          fontWeight: "medium"
        }}>
        {t("noNotifications") || "No notifications yet"}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "text.secondary",
          textAlign: "center",
          mt: 1
        }}>
        {t("checkBackLater") ||
          "When you get notifications, they'll show up here"}
      </Typography>
    </Box>
  );
};

export default EmptyNotifications;
