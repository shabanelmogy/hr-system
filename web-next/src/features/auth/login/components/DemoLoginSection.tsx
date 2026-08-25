import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import BoltIcon from "@mui/icons-material/Bolt";
import PersonIcon from "@mui/icons-material/Person";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Typography,
  type Theme,
} from "@mui/material";
import type { Translator } from "../../types";

export type DemoRole = "user" | "admin" | "superAdmin";

interface DemoLoginSectionProps {
  t: Translator;
  theme: Theme;
  isDarkMode: boolean;
  disabled: boolean;
  activeRole: DemoRole | null;
  onLoginAs: (role: DemoRole) => Promise<void>;
}

interface DemoRoleOption {
  key: DemoRole;
  labelKey: string;
  icon: React.ReactNode;
  color: string;
}

const roleOptions: DemoRoleOption[] = [
  {
    key: "user",
    labelKey: "auth.demoRoleUser",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#1e88e5",
  },
  {
    key: "admin",
    labelKey: "auth.demoRoleAdmin",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />,
    color: "#e53935",
  },
  {
    key: "superAdmin",
    labelKey: "auth.demoRoleSuperAdmin",
    icon: <WorkspacePremiumIcon sx={{ fontSize: 16 }} />,
    color: "#8e24aa",
  },
];

const DemoLoginSection = ({
  t,
  theme,
  isDarkMode,
  disabled,
  activeRole,
  onLoginAs,
}: DemoLoginSectionProps) => (
  <Box
    sx={{
      mt: 2.5,
      p: { xs: 1.5, sm: 2 },
      borderRadius: 3,
      border: "1px dashed",
      borderColor: isDarkMode
        ? alpha(theme.palette.primary.light, 0.3)
        : alpha(theme.palette.primary.main, 0.25),
      bgcolor: isDarkMode
        ? alpha(theme.palette.primary.dark, 0.18)
        : alpha(theme.palette.primary.main, 0.03),
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mb: 1.5,
      }}
    >
      <Box
        sx={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "#fff",
          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
        }}
      >
        <BoltIcon sx={{ fontSize: 15 }} />
      </Box>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          letterSpacing: "0.01em",
          color: isDarkMode ? "rgba(255,255,255,0.9)" : "text.primary",
        }}
      >
        {t("auth.demoAccessTitle")}
      </Typography>
      <Chip
        size="small"
        label={t("auth.demoAccessChip")}
        sx={{
          height: 20,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          bgcolor: isDarkMode
            ? alpha(theme.palette.warning.main, 0.18)
            : alpha(theme.palette.warning.main, 0.12),
          color: isDarkMode ? theme.palette.warning.light : theme.palette.warning.dark,
          border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
        }}
      />
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 1,
      }}
    >
      {roleOptions.map((role) => {
        const isLoading = activeRole === role.key;
        return (
          <Button
            key={role.key}
            type="button"
            fullWidth
            disableElevation
            onClick={() => onLoginAs(role.key)}
            disabled={disabled}
            startIcon={
              isLoading ? (
                <CircularProgress size={16} sx={{ color: role.color }} />
              ) : (
                <Box
                  data-role-badge="true"
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    background: alpha(role.color, 0.14),
                    color: role.color,
                    transition: "transform 0.25s ease",
                  }}
                >
                  {role.icon}
                </Box>
              )
            }
            sx={{
              flex: 1,
              py: 0.9,
              px: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              fontSize: 13,
              justifyContent: "flex-start",
              textAlign: "left",
              color: isDarkMode ? "rgba(255,255,255,0.85)" : "text.primary",
              borderColor: isDarkMode
                ? alpha("#fff", 0.12)
                : alpha(theme.palette.divider, 0.9),
              bgcolor: isDarkMode ? alpha("#fff", 0.04) : alpha("#fff", 0.85),
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              "& .MuiButton-startIcon": { mr: 1 },
              "&:hover": {
                borderColor: alpha(role.color, 0.6),
                bgcolor: alpha(role.color, isDarkMode ? 0.12 : 0.06),
                transform: "translateY(-2px)",
                boxShadow: `0 6px 16px ${alpha(role.color, 0.28)}`,
                "& [data-role-badge='true']": {
                  transform: "scale(1.12)",
                },
              },
              "&.Mui-disabled": {
                borderColor: isDarkMode
                  ? alpha("#fff", 0.08)
                  : alpha(theme.palette.divider, 0.6),
                bgcolor: isDarkMode ? alpha("#fff", 0.02) : alpha("#fff", 0.5),
              },
            }}
          >
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {t(role.labelKey)}
            </Box>
          </Button>
        );
      })}
    </Box>
  </Box>
);

export default DemoLoginSection;
