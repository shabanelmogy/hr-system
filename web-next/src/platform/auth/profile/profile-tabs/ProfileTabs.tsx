import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import {
  alpha,
  Box,
  Fade,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ChangePassword from "./change-password/ChangePassword";
import PersonalInfo from "./personal-info/PersonalInfo";
import type { ProfileUserData } from "../types";

interface ProfileTabsProps {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  showSuccess?: (message: string, title: string) => void;
  showError?: (message: string, title: string) => void;
  onInfoUpdated?: (data: ProfileUserData) => void;
}

const ProfileTabs = ({
  tabIndex,
  setTabIndex,
  showSuccess,
  showError,
  onInfoUpdated,
}: ProfileTabsProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        width: "100%",
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 52,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
          "& .MuiTabs-flexContainer": {
            justifyContent: { sm: "center" },
          },
          "& .MuiTabs-indicator": {
            height: 3,
            borderRadius: "3px 3px 0 0",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.9rem", sm: "1rem" },
            minHeight: 52,
            px: { xs: 2, sm: 4 },
            transition: "background-color 0.2s ease, color 0.2s ease",
            "&.Mui-selected": {
              color: theme.palette.mode === "dark" ? "#8b5cf6" : "#3b82f6",
            },
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            },
          },
        }}
      >
        <Tab
          icon={<PersonIcon sx={{ mb: 0.5 }} />}
          label={t("auth.personalInfo")}
          iconPosition="start"
        />
        <Tab
          icon={<LockIcon sx={{ mb: 0.5 }} />}
          label={t("auth.changePassword")}
          iconPosition="start"
        />
      </Tabs>

      <Box
        sx={{
          pt: { xs: 2, md: 3 },
          position: "relative",
        }}
      >
        <Fade in={tabIndex === 0} timeout={600}>
          <Box sx={{ display: tabIndex === 0 ? "block" : "none" }}>
            <PersonalInfo
              showSuccess={showSuccess}
              showError={showError}
              onInfoUpdated={onInfoUpdated}
            />
          </Box>
        </Fade>

        <Fade in={tabIndex === 1} timeout={600}>
          <Box sx={{ display: tabIndex === 1 ? "block" : "none" }}>
            <ChangePassword
              showSuccess={showSuccess}
              showError={showError}
            />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default ProfileTabs;
