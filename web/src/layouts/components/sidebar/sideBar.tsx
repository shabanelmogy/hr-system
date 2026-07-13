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
import DrawerHeader from "./drawerHeader";
import { getNavigationConfig } from "./navigationConfig";
import NavigationSection from "./navigationSection";
import UserProfile from "./userProfile";
// Drawer Sizes
const drawerWidth = 240;
const miniDrawerWidth = 64;

// Search container
const SearchContainer = styled("div")<{ open: boolean }>(({ theme, open }) => ({
  display: open ? "flex" : "none",
  width: "calc(100% - 16px)",
  alignItems: "center",
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.1),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  margin: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
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
}));

const ClearButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0.5),
  position: "absolute",
  right: 0,
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
  display: open ? "flex" : "none",
  width: "100%",
  justifyContent: "flex-start",
  padding: theme.spacing(1, 2),
  textTransform: "none",
  borderRadius: 0,
  fontWeight: 500,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,

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

  // Track expanded sections with an object
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Get navigation configuration
  const navigationSections = getNavigationConfig();



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
      variant={isSmallScreen ? "temporary" : "permanent"}
      open={open || !isSmallScreen}
      onClose={handleDrawerClose}
      sx={{
        width: isSmallScreen
          ? drawerWidth
          : open
          ? drawerWidth
          : miniDrawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isSmallScreen
            ? drawerWidth
            : open
            ? drawerWidth
            : miniDrawerWidth,
          boxSizing: "border-box",
          overflowX: "hidden",
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      <DrawerContent>
        {/* Drawer Header - Always Show*/}
        <DrawerHeader
          handleDrawerClose={handleDrawerClose}
          anySectionExpanded={false} // Force to always be visible
        />

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
        <SearchContainer open={open} sx={{ mt: 3 }}>
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
