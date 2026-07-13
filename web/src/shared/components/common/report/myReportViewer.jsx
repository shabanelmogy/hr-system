/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";

const MyReportViewer = ({
  children,
  reportApiBaseUrl,
  reportParams = {}, // Single object for all report parameters
  onSearch = () => {},
  initialOpen = true,
}) => {
  const [searchParams, setSearchParams] = useState({});
  const [reportUrl, setReportUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen);

  const theme = useTheme();
  const lang = theme.direction === "rtl" ? "ar" : "en";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Constants
  const sidebarWidth = 280;
  const topOffset = isMobile ? 60 : 120;
  const marginBetween = 8;
  const mobileHeaderHeight = 48;

  // Close sidebar automatically on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    handleSearch();
  }, [lang]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const generateReportUrl = (searchParams) => {
    // Combine default report parameters with search parameters
    const allParams = {
      Lang: lang,
      ...reportParams,
      ...searchParams,
    };

    const queryString = Object.entries(allParams)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    return `${reportApiBaseUrl}report/generate?${queryString}&rc:Toolbar=true`;
  };

  const handleSearch = () => {
    setLoading(true);
    const url = generateReportUrl(searchParams);
    setReportUrl(url);

    onSearch(searchParams);

    // Simulating API call delay
    setTimeout(() => {
      setLoading(false);
      // Close sidebar on mobile after search
      if (isMobile) {
        setSidebarOpen(false);
      }
    }, 1000);
  };

  // Function to be passed to children to update search params
  const updateSearchParams = (newParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: `calc(100vh - ${topOffset}px)`,
        width: "100%",
        position: "relative",
      }}
    >
      {/* Mobile Header - Always visible */}
      {isMobile && (
        <Box
          sx={{
            width: "100%",
            height: mobileHeaderHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#1976d2",
            color: "white",
            cursor: "pointer",
            zIndex: 11,
          }}
          onClick={toggleSidebar}
        >
          <Box sx={{ flexGrow: 1, pl: 2 }}>Search Options</Box>
          <IconButton color="inherit" size="small" sx={{ mr: 1 }}>
            {sidebarOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
      )}

      {/* Sidebar - Full width on mobile, fixed width on desktop */}
      <Paper
        elevation={3}
        sx={{
          width: isMobile ? "100%" : sidebarOpen ? sidebarWidth : 0,
          height: isMobile ? (sidebarOpen ? "auto" : "0px") : "100%",
          display: isMobile && !sidebarOpen ? "none" : "flex",
          transition: isMobile
            ? "height 0.3s ease-in-out"
            : "width 0.3s ease-in-out",
          overflow: "hidden",
          borderRadius: 0,
          position: "relative",
          zIndex: 10,
          flexDirection: "column",
          marginRight: isMobile ? 0 : sidebarOpen ? marginBetween : 0,
        }}
      >
        {/* Sidebar Content */}
        <Box
          sx={{
            width: "100%",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Render children and pass updateSearchParams function */}
          {typeof children === "function"
            ? children(updateSearchParams, searchParams)
            : children}

          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<Search />}
            fullWidth
            sx={{ mt: 1 }}
          >
            SEARCH
          </Button>
        </Box>
      </Paper>

      {/* Desktop Toggle Button */}
      {!isMobile && (
        <Box
          sx={{
            position: "absolute",
            left: sidebarOpen ? sidebarWidth : 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            transition: "left 0.3s ease-in-out",
          }}
        >
          <IconButton
            onClick={toggleSidebar}
            size="medium"
            sx={{
              backgroundColor: "#1976d2",
              color: "white",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
              boxShadow: 2,
              borderRadius: sidebarOpen ? "0 4px 4px 0" : "4px 0 0 4px",
            }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}

      {/* Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          height: isMobile
            ? `calc(100% - ${mobileHeaderHeight}px - ${
                sidebarOpen ? "auto" : "0px"
              })`
            : "100%",
          position: "relative",
          zIndex: 5,
          overflow: "hidden",
          marginTop: isMobile ? marginBetween : 0,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <iframe
            key={reportUrl}
            src={reportUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
            }}
            title="Report Viewer"
            allowFullScreen
          />
        )}
      </Box>
    </Box>
  );
};

export default MyReportViewer;