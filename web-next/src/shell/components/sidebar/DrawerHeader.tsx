import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  alpha,
  Fade,
  IconButton,
  styled,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Styled Drawer Header
const StyledDrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Close button container
const CloseButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0.5, 0),
}));

function DrawerHeader({ open, handleDrawerClose }: {
  open: boolean;
  handleDrawerClose: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <StyledDrawerHeader dir={theme.direction}>
      <CloseButtonContainer>
        <Fade in={open} timeout={theme.transitions.duration.shortest}>
          <Tooltip
            title={t("menu.closeSidebar")}
            placement={theme.direction === "rtl" ? "left" : "right"}
          >
            <IconButton
              aria-label={t("menu.closeSidebar")}
              onClick={handleDrawerClose}
              tabIndex={open ? 0 : -1}
              sx={{
                pointerEvents: open ? "auto" : "none",
                color: "text.secondary",
                backgroundColor: alpha(theme.palette.primary.main, 0.06),
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              {theme.direction === "rtl" ? (
                <ChevronRightRoundedIcon />
              ) : (
                <ChevronLeftRoundedIcon />
              )}
            </IconButton>
          </Tooltip>
        </Fade>
      </CloseButtonContainer>
    </StyledDrawerHeader>
  );
}

export default DrawerHeader;
