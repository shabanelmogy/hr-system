import {
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  alpha,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";

const SettingsMenu = ({
  anchorEl,
  open,
  onClose,
  navigateToProfile,
  handleLogout,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  navigateToProfile: () => void;
  handleLogout: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useSession();
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U";
  const role = user?.roles?.[0]
    ? user.roles[0].charAt(0).toUpperCase() + user.roles[0].slice(1).toLowerCase()
    : "";

  return (
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: theme.direction === "rtl" ? "left" : "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: theme.direction === "rtl" ? "left" : "right",
      }}
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{
        list: {
          "aria-label": t("menu.settings"),
          dir: theme.direction,
          sx: {
            p: 0.75,
          },
        },
        paper: {
          dir: theme.direction,
          sx: {
            mt: 1,
            width: "min(340px, calc(100vw - 24px))",
            maxWidth: "calc(100vw - 24px)",
            overflow: "hidden",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            boxShadow: theme.shadows[8],
          },
        },
      }}
    >
      <Box
        dir={theme.direction}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.25,
          py: 1.1,
          mb: 0.75,
          borderRadius: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,
            fontSize: "0.85rem",
            fontWeight: 700,
            color: theme.palette.primary.contrastText,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0, textAlign: "start" }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {t("dashboard.welcome")}
          </Typography>
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            {displayName || user?.userName || t("general.profile")}
          </Typography>
          <Typography variant="caption" color="primary.main" noWrap>
            {role || user?.email || t("auth.accountSecurity")}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 0.75 }} />

      <MenuItem
        dir={theme.direction}
        onClick={navigateToProfile}
        sx={{
          minHeight: 44,
          borderRadius: 1.25,
          columnGap: 1.5,
          alignItems: "flex-start",
          textAlign: "start",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 28,
            width: 28,
            flexShrink: 0,
            m: 0,
            color: theme.palette.primary.main,
          }}
        >
          <PersonIcon fontSize="small" />
        </ListItemIcon>
        <Box sx={{ minWidth: 0, flex: 1, textAlign: "start" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t("general.profile")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", lineHeight: 1.35 }}
          >
            {t("menu.profileDescription")}
          </Typography>
        </Box>
      </MenuItem>

      <MenuItem
        dir={theme.direction}
        onClick={handleLogout}
        sx={{
          minHeight: 44,
          mt: 0.35,
          borderRadius: 1.25,
          columnGap: 1.5,
          alignItems: "flex-start",
          textAlign: "start",
          color: theme.palette.error.main,
          "&:hover": {
            backgroundColor: alpha(theme.palette.error.main, 0.1),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 28,
            width: 28,
            flexShrink: 0,
            m: 0,
            color: "inherit",
          }}
        >
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        <Box sx={{ minWidth: 0, flex: 1, textAlign: "start" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t("auth.logout")}
          </Typography>
          <Typography
            variant="caption"
            color="inherit"
            sx={{ display: "block", lineHeight: 1.35, opacity: 0.75 }}
          >
            {t("menu.logoutDescription")}
          </Typography>
        </Box>
      </MenuItem>
    </Menu>
  );
};

export default SettingsMenu;
