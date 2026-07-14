/* eslint-disable react/prop-types */
// NavigationItem.jsx
import { ListItemIcon, ListItemText, Tooltip, Collapse, List } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import { grey } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import { useSession } from "@/lib/auth/SessionContext";
import { normalizeAppPath } from "@/config/routes";
import type { PermissionString } from "@/lib/auth/permissions";

function NavigationItem({
  open,
  title,
  titleComponent,
  icon,
  path,
  searchTerm,
  onNavigate,
  roles = [],
  permissions = [],
  items = [],
}: {
  open: boolean;
  title: string;
  titleComponent?: React.ReactNode;
  icon: React.ReactNode;
  path?: string;
  searchTerm: string;
  onNavigate: (path: string) => void;
  roles?: string[];
  permissions?: PermissionString[];
  items?: any[];
}) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { hasRole, hasPermission } = useSession();
  const hasChildren = items && items.length > 0;

  // Check if user has access based on roles or permissions
  const hasAccess = () => {
    // If no roles or permissions specified, allow access
    if (roles.length === 0 && permissions.length === 0) {
      return true;
    }

    // Check if user has any of the specified roles
    const matchesRole = roles.length > 0 ? hasRole(roles) : false;

    // Check if user has any of the specified permissions
    const matchesPermission = permissions.length > 0 ? hasPermission(permissions) : false;

    // User can access if they have any of the roles OR any of the permissions
    return matchesRole || matchesPermission;
  };

  // Don't render if user doesn't have access
  if (!hasAccess()) {
    return null;
  }

  // Normalize path for consistent comparison
  const normalizedPath = path ? normalizeAppPath(path) : null;
  const isActive = normalizedPath !== null && pathname === normalizedPath;
  const activeBgColor = theme.palette.mode === "dark" ? grey[900] : grey[300];

  // Check if this item matches the search
  const itemMatches =
    searchTerm && title.toLowerCase().includes(searchTerm.toLowerCase());

  // Background color logic - active or search match
  const getBgColor = () => {
    if (isActive) return activeBgColor;
    if (itemMatches) return alpha(theme.palette.primary.main, 0.08);
    return undefined;
  };

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (normalizedPath) {
      // Pass the path to onNavigate so we know which section to keep expanded
      if (onNavigate) {
        onNavigate(normalizedPath);
      }

      // Navigate to the page
      router.push(normalizedPath);
    }
  };

  return (
    <>
      <Tooltip
        title={open ? null : title}
        placement={theme.direction === "rtl" ? "left" : "right"}
      >
        <ListItemButton
          dir={theme.direction}
          onClick={handleClick}
          sx={[
            {
              minHeight: 48,
              paddingInlineStart: theme.spacing(4),
              textAlign: "start",
              bgcolor: getBgColor(),
              transition: theme.transitions.create(
                ["background-color", "padding"],
                { duration: theme.transitions.duration.shortest },
              ),
            },
            open
              ? {
                  justifyContent: "initial",
                }
              : {
                  justifyContent: "center",
                  paddingInlineStart: theme.spacing(2.25),
                  paddingInlineEnd: theme.spacing(2.25),
                },
          ]}
        >
          <ListItemIcon
            sx={[
              {
                minWidth: 28,
                width: 28,
                flexShrink: 0,
                justifyContent: "center",
                transition: theme.transitions.create("margin", {
                  duration: theme.transitions.duration.shortest,
                }),
              },
              open
                ? {
                    marginInlineEnd: theme.spacing(3),
                  }
                : {
                    marginInlineEnd: 0,
                  },
            ]}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={titleComponent || title}
            sx={{
              flex: open ? "1 1 auto" : "0 0 0",
              minWidth: 0,
              maxWidth: open ? 144 : 0,
              opacity: open ? 1 : 0,
              overflow: "hidden",
              textAlign: "start",
              pointerEvents: "none",
              transition: theme.transitions.create(
                ["flex-basis", "max-width", "opacity"],
                {
                  duration: open
                    ? theme.transitions.duration.enteringScreen
                    : theme.transitions.duration.leavingScreen,
                },
              ),
              "& .MuiListItemText-primary": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          />
          {open && hasChildren && (expanded ? <ExpandLess /> : <ExpandMore />)}
        </ListItemButton>
      </Tooltip>
      {hasChildren && (
        <Collapse in={expanded && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {items.map((childItem) => (
              <NavigationItem
                key={childItem.path}
                open={open}
                title={t(childItem.title)}
                titleComponent={
                  <span
                    style={{
                      backgroundColor:
                        searchTerm &&
                        t(childItem.title).toLowerCase().includes(searchTerm.toLowerCase())
                          ? alpha(theme.palette.primary.main, 0.2)
                          : "transparent",
                      fontWeight:
                        searchTerm &&
                        t(childItem.title).toLowerCase().includes(searchTerm.toLowerCase())
                          ? "bold"
                          : "inherit",
                      padding:
                        searchTerm &&
                        t(childItem.title).toLowerCase().includes(searchTerm.toLowerCase())
                          ? "0 2px"
                          : "0",
                      borderRadius:
                        searchTerm &&
                        t(childItem.title).toLowerCase().includes(searchTerm.toLowerCase())
                          ? "2px"
                          : "0",
                    }}
                  >
                    {t(childItem.title)}
                  </span>
                }
                icon={childItem.icon}
                path={childItem.path}
                searchTerm={searchTerm}
                onNavigate={onNavigate}
                roles={childItem.roles || []}
                permissions={childItem.permissions || []}
                items={childItem.items || []}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

export default NavigationItem;
