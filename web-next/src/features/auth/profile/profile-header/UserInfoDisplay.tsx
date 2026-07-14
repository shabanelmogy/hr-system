import {
  Chip,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { useTranslation } from "react-i18next";
import type { ProfileUserData } from "../types";

interface UserInfoDisplayProps {
  userData: ProfileUserData;
  uploadProgress: boolean;
}

const UserInfoDisplay = ({ userData, uploadProgress }: UserInfoDisplayProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const displayName = [userData.firstName, userData.lastName].filter(Boolean).join(" ") || userData.userName || t("general.profile");
  const primaryRole = userData.roles?.[0];

  return (
    <Stack
      spacing={1.5}
      sx={{
        flexGrow: 1,
        minWidth: 0,
        alignItems: { xs: "center", md: "flex-start" },
        textAlign: { xs: "center", md: "start" },
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", maxWidth: "100%" }}>
        <Typography
          component="h2"
          variant="h5"
          sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {displayName}
        </Typography>
        <VerifiedUserIcon color="primary" fontSize="small" aria-label={t("auth.imageVerified")} />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
        {userData.userName ? `@${userData.userName}` : t("general.profile")}
      </Typography>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          flexWrap: "wrap",
          justifyContent: { xs: "center", md: "flex-start" },
        }}
      >
        {userData.email && (
          <Chip
            icon={<EmailOutlinedIcon sx={{ fontSize: 17 }} />}
            label={userData.email}
            variant="outlined"
            sx={{
              maxWidth: "100%",
              borderColor: alpha(theme.palette.primary.main, 0.3),
              "& .MuiChip-icon": { color: theme.palette.primary.main },
              "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" },
            }}
          />
        )}
        {userData.phoneNumber && (
          <Chip
            icon={<PhoneOutlinedIcon sx={{ fontSize: 17 }} />}
            label={userData.phoneNumber}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.info.main, 0.3),
              "& .MuiChip-icon": { color: theme.palette.info.main },
            }}
          />
        )}
        {primaryRole && (
          <Chip
            label={primaryRole}
            size="small"
            color="primary"
            variant="filled"
            sx={{ fontWeight: 600 }}
          />
        )}
        {uploadProgress && (
          <Chip
            icon={<CheckCircleOutlinedIcon sx={{ fontSize: 17 }} />}
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
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default UserInfoDisplay;
