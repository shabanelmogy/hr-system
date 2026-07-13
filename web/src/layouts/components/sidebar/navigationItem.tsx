/* eslint-disable react/prop-types */
// NavigationItem.jsx
import { ListItemIcon, ListItemText, Tooltip, Collapse, List } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import { useTheme } from "@mui/material/styles";
import { useLocation, useNavigate } from "react-router-dom";
import { grey } from "@mui/material/colors";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useTranslation } from "react-i18next";
import AuthService from "../../../shared/services/authService";

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
  path: string;
  searchTerm: string;
  onNavigate: (path: string) => void;
  roles?: string[];
  permissions?: string[];
  items?: any[];
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = items && items.length > 0;

  // Check if user has access based on roles or permissions
  const hasAccess = () => {
    // If no roles or permissions specified, allow access
    if (roles.length === 0 && permissions.length === 0) {
      return true;
    }

    // Check if user has any of the specified roles
    const hasRole = roles.length > 0 ? AuthService.isInRole(roles) : false;

    // Check if user has any of the specified permissions
    const hasPermission =
      permissions.length > 0 ? AuthService.hasPermission(permissions) : false;

    // User can access if they have any of the roles OR any of the permissions
    return hasRole || hasPermission;
  };

  // Don't render if user doesn't have access
  if (!hasAccess()) {
    return null;
  }

  // Normalize path for consistent comparison
  const normalizedPath = `/${path}`.replace(/^\/+/, "/"); // Ensure single leading slash
  const isActive = location.pathname === normalizedPath;
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
    } else {
      // Pass the path to onNavigate so we know which section to keep expanded
      if (onNavigate) {
        onNavigate(path);
      }

      // Navigate to the page
      navigate(`/${path}`);
    }
  };

  return (
    <>
      <Tooltip title={open ? null : title} placement="left">
        <ListItemButton
          onClick={handleClick}
          sx={[
            {
              minHeight: 48,
              pl: 4,
              bgcolor: getBgColor(),
            },
            open
              ? {
                  justifyContent: "initial",
                }
              : {
                  justifyContent: "center",
                },
          ]}
        >
          <ListItemIcon
            sx={[
              {
                minWidth: 0,
                justifyContent: "center",
              },
              open
                ? {
                    mr: 3,
                  }
                : {
                    mr: "auto",
                  },
            ]}
          >
            {icon}
          </ListItemIcon>
          <ListItemText
            primary={titleComponent || title}
            sx={[
              open
                ? {
                    opacity: 1,
                  }
                : {
                    opacity: 0,
                  },
            ]}
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
