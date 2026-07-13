/* eslint-disable react/prop-types */
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Avatar, Box, Tooltip, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";
import { useUserInfo, useUserPhoto } from "../../../shared/hooks";
import AuthService from "../../../shared/services/authService";

interface UserProfileProps {
  open: boolean;
}

const UserProfile = ({ open }: UserProfileProps) => {
  const theme = useTheme();
  const { data: info, isLoading: infoLoading } = useUserInfo();
  const { data: photoData, isLoading: photoLoading } = useUserPhoto();

  const userRole = useMemo(() => {
    const currentUser = AuthService.getCurrentUser();
    const role = currentUser?.roles?.[0] || "User";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }, []);

  const displayName = useMemo(() => {
    if (!info) return "User";
    if (info.firstName && info.lastName) return `${info.firstName} ${info.lastName}`;
    return info.userName || info.email || "User";
  }, [info]);

  const initials = useMemo(() => {
    if (!info) return "U";
    if (info.firstName && info.lastName) return `${info.firstName[0]}${info.lastName[0]}`.toUpperCase();
    if (info.userName) return info.userName.charAt(0).toUpperCase();
    return "U";
  }, [info]);

  const avatarSrc = photoData?.profilePicture ? `data:image/*;base64,${photoData.profilePicture}` : undefined;

  const getRoleIcon = () => {
    const role = userRole.toLowerCase();
    if (role.includes("admin")) {
      return <AdminPanelSettingsIcon fontSize="small" sx={{ color: "#ff6b6b" }} />;
    }
    if (role.includes("manager") || role.includes("supervisor")) {
      return <SupervisorAccountIcon fontSize="small" sx={{ color: "#ffd93d" }} />;
    }
    if (role.includes("engineer") || role.includes("developer")) {
      return <EngineeringIcon fontSize="small" sx={{ color: "#6bcf7f" }} />;
    }
    return <PersonIcon fontSize="small" sx={{ color: "#a8dadc" }} />;
  };

  if (infoLoading && photoLoading) {
    return (
      <Box
        sx={{
          p: 1.5,
          mx: 1,
          mt: 1,
          mb: 0,
          borderRadius: 2,
          textAlign: "center",
          background: theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)"
            : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 4px 12px rgba(0, 0, 0, 0.3)"
            : "0 4px 12px rgba(99, 102, 241, 0.2)",
        }}
      >
        <Avatar sx={{ mx: "auto", width: open ? 64 : 40, height: open ? 64 : 40 }}>
          <PersonIcon />
        </Avatar>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1.5,
        mx: 1,
        mt: 1,
        mb: 0,
        borderRadius: 2,
        textAlign: "center",
        overflow: "hidden",
        position: "relative",
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)"
          : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        boxShadow: theme.palette.mode === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(99, 102, 241, 0.2)",
        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.2)"}`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.palette.mode === "dark"
            ? "0 6px 16px rgba(0, 0, 0, 0.4)"
            : "0 6px 16px rgba(99, 102, 241, 0.3)",
        },
      }}
    >
      <Tooltip title={open ? "" : `${displayName} • ${userRole}`} placement="right" arrow>
        <Box 
          sx={{ 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            mb: open ? 0.5 : 0,
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <Avatar
              src={avatarSrc}
              sx={{
                width: open ? 64 : 40,
                height: open ? 64 : 40,
                bgcolor: theme.palette.primary.main,
                border: "3px solid rgba(255, 255, 255, 0.2)",
              }}
              alt={displayName}
            >
              {open ? initials : <PersonIcon />}
            </Avatar>
            {/* Online indicator - positioned inside avatar bounds */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "#4ade80",
                border: "2px solid white",
                boxShadow: "0 0 0 2px rgba(74, 222, 128, 0.3)",
              }}
            />
          </Box>
        </Box>
      </Tooltip>

      {open && (
        <>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              mb: 0.5,
              color: "white",
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }}
          >
            {displayName}
          </Typography>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            {getRoleIcon()}
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 500,
                color: "white",
              }}
            >
              {userRole}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserProfile;
