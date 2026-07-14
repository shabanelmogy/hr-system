/* eslint-disable react/prop-types */
// SideBar.jsx
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import {
  alpha,
  Box,
  Button,
  Collapse,
  Divider,
  IconButton,
  InputBase,
  Drawer as MuiDrawer,
  styled,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DrawerHeader from "./DrawerHeader";
import { getNavigationConfig } from "./navigationConfig";
import NavigationSection from "./NavigationSection";
import UserProfile from "./UserProfile";
import { useSession } from "@/lib/auth/SessionContext";
// Drawer Sizes
const drawerWidth = 240;
const miniDrawerWidth = 64;

// Search container
const SearchContainer = styled("div")<{ open: boolean }>(({ theme, open }) => ({
  display: "flex",
  width: "calc(100% - 16px)",
  minHeight: open ? 40 : 0,
  maxHeight: open ? 48 : 0,
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  transform: open ? "translateY(0)" : "translateY(-4px)",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  marginInline: theme.spacing(1),
  marginTop: open ? theme.spacing(3) : 0,
  marginBottom: open ? theme.spacing(1) : 0,
  border: `1px solid ${open ? alpha(theme.palette.divider, 0.2) : "transparent"}`,
  transition: theme.transitions.create(
    ["max-height", "min-height", "opacity", "transform", "margin-top", "margin-bottom"],
    {
      easing: theme.transitions.easing.sharp,
      duration: open
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    },
  ),
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  insetInlineStart: 0,
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  position: "absolute",
  insetInlineEnd: 0,
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 4, 1, 4),
    width: "100%",
    fontSize: "0.875rem",
  },
}));

// Main drawer content container with scrolling
const DrawerContent = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "hidden",
}));

// Scrollable area
const ScrollableContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  overflowX: "hidden",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.text.primary, 0.2),
    borderRadius: "3px",
  },
  "&::-webkit-scrollbar-track": {
    background: alpha(theme.palette.text.primary, 0.05),
  },
}));

const ToggleButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "expanded" && prop !== "open",
})<{ open: boolean; expanded: boolean }>(({ theme, open }) => ({
  display: "flex",
  width: "100%",
  minHeight: open ? 40 : 0,
  maxHeight: open ? 48 : 0,
  justifyContent: "flex-start",
  overflow: "hidden",
  opacity: open ? 1 : 0,
  pointerEvents: open ? "auto" : "none",
  padding: open ? theme.spacing(1, 2) : theme.spacing(0, 2),
  textTransform: "none",
  borderRadius: 0,
  fontWeight: 500,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${open ? alpha(theme.palette.divider, 0.5) : "transparent"}`,
  transition: theme.transitions.create(
    ["max-height", "min-height", "opacity", "padding"],
    {
      easing: theme.transitions.easing.sharp,
      duration: open
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    },
  ),

  // Use CSS classes instead of props
  "&.expanded": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.12),
    },
  },
  "&:not(.expanded)": {
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: alpha(theme.palette.action.hover, 0.08),
    },
  },
}));

function SideBar({ open, handleDrawerClose }: { open: boolean; handleDrawerClose: () => void }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useSession();
  const currentDrawerWidth = isSmallScreen
    ? drawerWidth
    : open
      ? drawerWidth
      : miniDrawerWidth;
  const widthTransition = theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  });

  // Track expanded sections with an object
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Get navigation configuration
  const navigationSections = useMemo(
    () => getNavigationConfig(user?.roles, user?.permissions),
    [user?.permissions, user?.roles]
  );



  // Find which section contains a specific path (recursive for nested items)
  const findSectionByPath = (path: string) => {
    const findInItems = (items: any[]) => {
      for (const item of items) {
        if (item.path === path) {
          return true;
        }
        if (item.items && item.items.length > 0) {
          if (findInItems(item.items)) {
            return true;
          }
        }
      }
      return false;
    };

    for (const section of navigationSections) {
      if (findInItems(section.items)) {
        return section.id;
      }
    }
    return null;
  };

  // Calculate visible sections (for search)
  const visibleSections = useMemo(() => {
    if (!searchTerm) return navigationSections;
    return navigationSections.filter((section) => isSectionVisible(section));
  }, [navigationSections, searchTerm]);

  // Determine if all sections are currently expanded
  const areAllSectionsExpanded = useMemo(() => {
    // If no sections are visible, return false
    if (visibleSections.length === 0) return false;

    // Check if all visible sections are expanded
    return visibleSections.every((section) => !!expandedSections[section.id]);
  }, [visibleSections, expandedSections]);

  // Check if any section is expanded
  const isAnySectionExpanded = Object.values(expandedSections).some(
    (value) => value === true
  );

  // Handle toggle of a single section
  const handleSectionToggle = (sectionId: string, forceState: boolean | null = null) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: forceState !== null ? forceState : !prev[sectionId],
    }));
  };

  // Toggle all sections
  const toggleAllSections = () => {
    if (areAllSectionsExpanded) {
      // If all are expanded, collapse all
      setExpandedSections({});
    } else {
      // If not all are expanded, expand all visible sections
      const newState: Record<string, boolean> = {};
      visibleSections.forEach((section) => {
        newState[section.id] = true;
      });
      setExpandedSections(newState);
    }
  };

  // Clear search when navigating
  const handleNavigate = (path: string) => {
    // Find which section contains this path
    const sectionId = findSectionByPath(path);

    // Set only that section to be expanded
    if (sectionId) {
      const newExpandedState: Record<string, boolean> = {};
      newExpandedState[sectionId] = true;
      setExpandedSections(newExpandedState);
    }

    // Clear search term
    setSearchTerm("");

    // Close drawer on mobile
    if (isSmallScreen) {
      handleDrawerClose();
    }
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm("");
  };

  // Check if section or its items match search
  function isSectionVisible(section: any) {
    const sectionMatches =
      searchTerm &&
      t(section.title).toLowerCase().includes(searchTerm.toLowerCase());

    const itemsMatch = section.items.some(
      (item: any) =>
        searchTerm &&
        t(item.title).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return sectionMatches || itemsMatch;
  }

  // Check if there are any matches for the search term
  const hasSearchMatches = () => {
    if (!searchTerm) return true;
    return navigationSections.some((section) => isSectionVisible(section));
  };

  return (
    <MuiDrawer
      id="app-sidebar"
      dir={theme.direction}
      variant={isSmallScreen ? "temporary" : "permanent"}
      anchor="left"
      open={open || !isSmallScreen}
      onClose={handleDrawerClose}
      transitionDuration={{
        enter: theme.transitions.duration.enteringScreen,
        exit: theme.transitions.duration.leavingScreen,
      }}
      slotProps={{ paper: { dir: theme.direction } }}
      sx={{
        width: currentDrawerWidth,
        flexShrink: 0,
        transition: isSmallScreen ? undefined : widthTransition,
        "& .MuiDrawer-paper": {
          width: currentDrawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          whiteSpace: "nowrap",
          willChange: isSmallScreen ? undefined : "width",
          transition: isSmallScreen ? undefined : widthTransition,
          boxShadow: open && !isSmallScreen ? theme.shadows[2] : "none",
        },
      }}
    >
      <DrawerContent>
        {/* Drawer Header - Always Show*/}
        <DrawerHeader open={open} handleDrawerClose={handleDrawerClose} />

        {/* Toggle Expand/Collapse Button - Always visible */}
        <ToggleButton
          onClick={toggleAllSections}
          open={open}
          expanded={areAllSectionsExpanded}
          startIcon={
            areAllSectionsExpanded ? <UnfoldLessIcon /> : <UnfoldMoreIcon />
          }
        >
          {areAllSectionsExpanded
            ? t("menu.collapseAllSections")
            : t("menu.expandAllSections")}
        </ToggleButton>

        {/* User Profile - Hide when sections are expanded */}
        <Collapse in={!isAnySectionExpanded} timeout="auto">
          <Box sx={{ pb: 1 }}>
            <UserProfile open={open} />
          </Box>
        </Collapse>

        {/* Search Input */}
        <SearchContainer open={open}>
          <SearchIconWrapper>
            <SearchIcon fontSize="small" />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder={t("search.searchInSidebar")}
            inputProps={{ "aria-label": "search" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton size="small" onClick={handleClearSearch}>
              <ClearIcon fontSize="small" />
            </ClearButton>
          )}
        </SearchContainer>

        <ScrollableContent>
          {/* No Results Message */}
          {searchTerm && !hasSearchMatches() && (
            <Box
              sx={{
                p: 2,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
                my: 2,
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 40,
                  color: alpha(theme.palette.text.secondary, 0.6),
                }}
              />
              <Typography variant="body2">{t("No results found")}</Typography>
              <Typography variant="caption" sx={{ maxWidth: "80%" }}>
                {t("Try different keywords")}
              </Typography>
            </Box>
          )}

          {/* Navigation Sections */}
          {navigationSections.map((section, index) => (
            <div key={section.id}>
              <NavigationSection
                section={section}
                open={open}
                searchTerm={searchTerm}
                t={t}
                isExpanded={!!expandedSections[section.id]}
                onToggle={handleSectionToggle}
                onNavigate={handleNavigate}
              />
              {index < navigationSections.length - 1 &&
                (!searchTerm ||
                  (searchTerm &&
                    isSectionVisible(section) &&
                    navigationSections
                      .slice(index + 1)
                      .some((s) => isSectionVisible(s)))) && <Divider />}
            </div>
          ))}
        </ScrollableContent>
      </DrawerContent>
    </MuiDrawer>
  );
}

export default SideBar;
