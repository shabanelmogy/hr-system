/* eslint-disable react/prop-types */
import {
  Typography,
  Stack,
  Box,
  Badge,
  Chip,
  useTheme,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useTranslation } from "react-i18next";

interface UserInfoDisplayProps {
  userData: {
    userName?: string;
    email?: string;
    phoneNumber?: string;
    [key: string]: any;
  };
  uploadProgress: boolean;
}

const UserInfoDisplay = ({ userData, uploadProgress }: UserInfoDisplayProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const getCapitalizedUsername = () => {
    const username = userData.userName || "";
    // Return username in uppercase
    return username.toUpperCase();
  };

  return (
    <Stack
      spacing={2}
      sx={{
        flexGrow: 1,
        alignItems: { xs: "center", sm: "flex-start" },
        textAlign: { xs: "center", sm: "left" },
      }}
    >
      {/* Enhanced name display with badge */}
      <Box
        sx={{
          position: "relative",
          display: "inline-block",
        }}
      >
        {/* Gradient Text Underline */}
        <Box
          sx={{
            position: "absolute",
            bottom: -8,
            left: 0,
            width: "100%",
            height: 4,
            borderRadius: 4,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            opacity: 0.7,
            filter: "blur(1px)",
          }}
        />

        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color:
                theme.palette.mode === "dark"
                  ? "#fff"
                  : theme.palette.text.primary,
              letterSpacing: "-0.02em",
              background:
                theme.palette.mode === "dark"
                  ? "linear-gradient(90deg, #fff, #e2e8f0)"
                  : "linear-gradient(90deg, #1e293b, #334155)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow:
                theme.palette.mode === "dark"
                  ? "0px 2px 5px rgba(0, 0, 0, 0.5)"
                  : "none",
              position: "relative",
              fontFamily:
                '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
            }}
          >
            {getCapitalizedUsername()}
          </Typography>

          <Badge
            color="primary"
            variant="dot"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#10b981",
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
              },
            }}
          >
            <VerifiedUserIcon
              sx={{
                color: theme.palette.primary.main,
                ml: 1,
                fontSize: 22,
              }}
            />
          </Badge>
        </Stack>
      </Box>

      {/* User info details */}
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "flex-start" },
          }}
        >
          <Chip
            icon={<PersonIcon sx={{ fontSize: 18 }} />}
            label={userData.email}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.primary.main, 0.3),
              "& .MuiChip-icon": {
                color: theme.palette.primary.main,
              },
              borderRadius: "8px",
              transition: "all 0.2s ease",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          />

          {userData.phoneNumber && (
            <Chip
              icon={<BadgeIcon sx={{ fontSize: 18 }} />}
              label={userData.phoneNumber}
              variant="outlined"
              sx={{
                borderColor: alpha(theme.palette.info.main, 0.3),
                "& .MuiChip-icon": {
                  color: theme.palette.info.main,
                },
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: theme.palette.info.main,
                  backgroundColor: alpha(theme.palette.info.main, 0.05),
                },
              }}
            />
          )}

          {uploadProgress && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: 18 }} />}
              label={t("actions.updating")}
              color="success"
              variant="filled"
              sx={{
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%": { opacity: 1 },
                  "50%": { opacity: 0.7 },
                  "100%": { opacity: 1 },
                },
                borderRadius: "8px",
              }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default UserInfoDisplay;
