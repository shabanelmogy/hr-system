import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import EngineeringIcon from "@mui/icons-material/Engineering";
import { Avatar, Box, Tooltip, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";
import {
  getUserPhotoDataUrl,
  useUserPhoto,
} from "@/platform/auth/profile";
import { useSession } from "@/lib/auth/SessionContext";

interface UserProfileProps {
  open: boolean;
}

const UserProfile = ({ open }: UserProfileProps) => {
  const theme = useTheme();
  const { data: photoData } = useUserPhoto();
  const { user } = useSession();

  const userRole = useMemo(() => {
    const role = user?.roles?.[0] || "User";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }, [user]);

  const displayName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(" ");
    return fullName || user?.userName || user?.email || "User";
  }, [user?.email, user?.firstName, user?.lastName, user?.userName]);

  const nameInitials = [user?.firstName, user?.lastName]
    .filter((part): part is string => Boolean(part?.trim()))
    .map((part) => part.trim().charAt(0))
    .join("")
    .toUpperCase();
  const initials = nameInitials || user?.userName?.charAt(0).toUpperCase() || "U";

  const avatarSrc = getUserPhotoDataUrl(photoData);

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

  return (
    <Box
      dir={theme.direction}
      sx={{
        p: open ? 1 : 0.5,
        mx: 1,
        mt: 0.75,
        mb: 0,
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)"
          : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        boxShadow: theme.palette.mode === "dark"
          ? "0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 4px 12px rgba(99, 102, 241, 0.2)",
        border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.2)"}`,
        transition: theme.transitions.create(["padding", "box-shadow", "transform"], {
          duration: open
            ? theme.transitions.duration.enteringScreen
            : theme.transitions.duration.leavingScreen,
        }),
        "&:hover": {
          transform: open ? "translateY(-1px)" : "none",
          boxShadow: theme.palette.mode === "dark"
            ? "0 6px 16px rgba(0, 0, 0, 0.4)"
            : "0 6px 16px rgba(99, 102, 241, 0.3)",
        },
      }}
    >
      <Tooltip
        title={open ? "" : `${displayName} - ${userRole}`}
        placement={theme.direction === "rtl" ? "left" : "right"}
        arrow
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "flex-start" : "center",
            gap: open ? 1 : 0,
            minWidth: 0,
          }}
        >
          <Box sx={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
            <Avatar
              src={avatarSrc}
              sx={{
                width: open ? 42 : 38,
                height: open ? 42 : 38,
                bgcolor: theme.palette.primary.main,
                border: "2px solid rgba(255, 255, 255, 0.24)",
                transition: theme.transitions.create(["width", "height"], {
                  duration: open
                    ? theme.transitions.duration.enteringScreen
                    : theme.transitions.duration.leavingScreen,
                }),
              }}
              alt={displayName}
            >
              {initials || <PersonIcon />}
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

          <Box
            aria-hidden={!open}
            sx={{
              display: open ? "block" : "none",
              flex: 1,
              minWidth: 0,
              textAlign: "start",
            }}
          >
            <Tooltip title={displayName} enterDelay={600}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "white",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {displayName}
              </Typography>
            </Tooltip>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mt: 0.25,
                minWidth: 0,
                color: "rgba(255, 255, 255, 0.88)",
              }}
            >
              {getRoleIcon()}
              <Typography
                variant="caption"
                noWrap
                sx={{ fontWeight: 500, minWidth: 0 }}
              >
                {userRole}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Tooltip>
    </Box>
  );
};

export default UserProfile;
