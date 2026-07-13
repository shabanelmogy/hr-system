/* eslint-disable react/prop-types */
// UserWelcome.jsx
import { Avatar, Box, Fade, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AuthService from "../../../shared/services/authService";
import { useUserPhoto } from "../../../shared/hooks";

const UserWelcome = ({ isMobile = false }: { isMobile?: boolean }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  // Fetch user photo
  const { data: photoData } = useUserPhoto();
  const avatarSrc = photoData?.profilePicture
    ? `data:image/*;base64,${photoData.profilePicture}`
    : undefined;

  useEffect(() => {
    // Get firstName and lastName from sessionStorage
    const storedFirstName = localStorage.getItem("firstName");
    const storedLastName = localStorage.getItem("lastName");

    if (storedFirstName && storedLastName) {
      setFirstName(storedFirstName);
      setLastName(storedLastName);
    } else {
      // Fallback to getting from token if not in sessionStorage
      try {
        const token = sessionStorage.getItem("token");
        if (token) {
          const decodedToken = AuthService.getUserClaims();

          // Get user role
          const roleClaimKey =
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
          const roleClaim = (decodedToken as any)[roleClaimKey];
          const role =
            decodedToken.userRole ||
            (Array.isArray(roleClaim) ? roleClaim[0] : roleClaim) ||
            "";

          setUserRole(capitalizeFirstLetter(role));
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    }

    // Animate welcome message after a short delay
    setTimeout(() => setShowWelcome(true), 300);
  }, []);

  const capitalizeFirstLetter = (string: string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Get initials for avatar
  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";

    return (firstInitial + lastInitial).toUpperCase() || "U";
  };

  // Get color based on name for consistent colors
  const getUserColor = () => {
    const name = firstName + lastName;
    if (!name) return theme.palette.primary.main;

    const colors = [
      "#1976d2",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#ff9800",
      "#ff5722",
      "#f44336",
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to create rgba colors with alpha
  const alpha = (color: string, alphaValue: number) => {
    if (!color) return `rgba(0, 0, 0, ${alphaValue})`;

    // Handle hex color
    if (color.startsWith("#")) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
    }

    // Handle rgb color
    if (color.startsWith("rgb")) {
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${alphaValue})`;
      }
    }

    return `rgba(0, 0, 0, ${alphaValue})`;
  };

  // If no name found, don't render
  if (!firstName && !lastName) return null;

  // Mobile version (avatar only)
  if (isMobile) {
    return (
      <Fade in={showWelcome} timeout={800}>
        <Avatar
          src={avatarSrc}
          sx={{
            width: 32,
            height: 32,
            bgcolor: avatarSrc ? "transparent" : getUserColor(),
            color: "white",
            fontWeight: "bold",
            fontSize: "0.75rem",
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            cursor: "pointer",
            "&:hover": {
              transform: "scale(1.05)",
              transition: "transform 0.2s ease",
            },
          }}
        >
          {getInitials()}
        </Avatar>
      </Fade>
    );
  }

  // Desktop version (full welcome message)
  return (
    <Fade in={showWelcome} timeout={800}>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          borderRadius: 6,
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(90deg, ${alpha(
                  getUserColor(),
                  0.1
                )} 0%, rgba(66, 66, 66, 0.3) 100%)`
              : `linear-gradient(90deg, ${alpha(
                  getUserColor(),
                  0.1
                )} 0%, rgba(240, 240, 240, 0.6) 100%)`,
          border: `1px solid ${alpha(
            getUserColor(),
            theme.palette.mode === "dark" ? 0.3 : 0.2
          )}`,
          boxShadow:
            theme.palette.mode === "dark"
              ? `0 0 10px ${alpha(getUserColor(), 0.15)}`
              : `0 0 10px ${alpha(getUserColor(), 0.1)}`,
          transition: "all 0.3s ease",
          "&:hover": {
            background:
              theme.palette.mode === "dark"
                ? `linear-gradient(90deg, ${alpha(
                    getUserColor(),
                    0.15
                  )} 0%, rgba(66, 66, 66, 0.4) 100%)`
                : `linear-gradient(90deg, ${alpha(
                    getUserColor(),
                    0.15
                  )} 0%, rgba(240, 240, 240, 0.8) 100%)`,
            boxShadow: `0 0 12px ${alpha(
              getUserColor(),
              theme.palette.mode === "dark" ? 0.2 : 0.15
            )}`,
            transform: "translateY(-1px)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            src={avatarSrc}
            sx={{
              bgcolor: avatarSrc ? "transparent" : getUserColor(),
              color: "white",
              fontWeight: "bold",
              fontSize: "0.9rem",
              width: 38,
              height: 38,
              m: 0.8,
              boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            }}
          >
            {getInitials()}
          </Avatar>

          <Box sx={{ mx: 1.5, my: 1 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color:
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.7)"
                    : "rgba(0, 0, 0, 0.6)",
                fontSize: "0.75rem",
                lineHeight: 1,
                mb: 0.3,
              }}
            >
              {t("dashboard.welcome")}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: "bold",
                lineHeight: 1.2,
                fontSize: "0.95rem",
                color:
                  theme.palette.mode === "dark"
                    ? "white"
                    : "rgba(0, 0, 0, 0.87)",
                maxWidth: 180,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {firstName} {lastName}
            </Typography>

            {userRole && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: alpha(
                    getUserColor(),
                    theme.palette.mode === "dark" ? 0.9 : 0.7
                  ),
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  lineHeight: 1,
                  mt: 0.3,
                }}
              >
                {userRole}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
};

export default UserWelcome;
