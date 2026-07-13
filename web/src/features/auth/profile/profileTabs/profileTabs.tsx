/* eslint-disable react/prop-types */
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import {
  alpha,
  Box,
  Divider,
  Fade,
  Paper,
  Tab,
  Tabs,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import ChangePassword from "./changePassword/changePassword";
import PersonalInfo from "./personalInfo/personalInfo";

interface ProfileTabsProps {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  showSuccess?: (message: string, title: string) => void;
  showError?: (message: string, title: string) => void;
  onInfoUpdated?: (data: any) => void;
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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background:
          theme.palette.mode === "dark" ? "rgba(30, 30, 30, 0.8)" : "#ffffff",
        backdropFilter: theme.palette.mode === "dark" ? "blur(10px)" : "none",
        border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 4px 20px ${alpha(theme.palette.common.black, 0.2)}`
            : `0 4px 20px ${alpha(theme.palette.common.black, 0.06)}`,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={(_, newIndex) => setTabIndex(newIndex)}
        variant="fullWidth"
        sx={{
          "& .MuiTabs-indicator": {
            borderRadius: "3px 3px 0 0",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, #6366f1, #8b5cf6)"
                : "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          },
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "1rem",
            py: 1,
            transition: "all 0.3s ease",
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

      <Divider />

      {/* Tab Content with Enhanced Container */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          minHeight: 350,
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
    </Paper>
  );
};

export default ProfileTabs;
