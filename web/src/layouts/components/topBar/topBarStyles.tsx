import { styled } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import { Toolbar, ListItem } from "@mui/material";

const drawerWidth = 240;

// AppBar styled component
export const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open?: boolean }>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  boxSizing: "border-box",
  className: "mui-fixed",
  position: "fixed",
  left: 0,
  width: "calc(100vw - 1px)",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100vw - ${drawerWidth}px - 1px)`,
  }),
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

// Toolbar styled component
export const StyledToolbar = styled(Toolbar)<{ open?: boolean }>(({ theme, open }) => ({
  width: "100%",
  maxWidth: open ? `calc(100vw - ${drawerWidth}px - 1px)` : "calc(100vw - 1px)",
  boxSizing: "border-box",
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(0, 2),
  margin: 0,
}));

// ListItem styled component
export const StyledListItem = styled(ListItem)(({ theme }) => ({
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// NotificationItem styled component
export const NotificationItem = styled(ListItem)<{ isNew?: boolean }>(({ theme, isNew }) => ({
  cursor: "pointer",
  backgroundColor: isNew ? theme.palette.action.selected : "transparent",
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  "&:hover": {
    backgroundColor: isNew
      ? theme.palette.action.hover
      : theme.palette.action.hover,
  },
  transition: theme.transitions.create(["background-color"], {
    duration: theme.transitions.duration.shortest,
  }),
}));
