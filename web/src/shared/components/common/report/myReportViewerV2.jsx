import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  KeyboardArrowDown,
  KeyboardArrowUp,
  DescriptionOutlined,
} from "@mui/icons-material";
import PropTypes from "prop-types";
import { reportApiService } from "@/shared/services";

const MyReportViewerV2 = ({
  children,
  reportParams = {}, // Default report parameters (ReportPath, ReportFileName, etc.)
  onSearch = () => {},
  initialOpen = true,
}) => {
  const [searchParams, setSearchParams] = useState({});
  const [reportUrl, setReportUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(initialOpen);

  const theme = useTheme();
  const lang = theme.direction === "rtl" ? "ar" : "en";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Constants
  const sidebarWidth = 280;
  const topOffset = isMobile ? 60 : 120;
  const margnBetween = 8;
  const mobileHeaderHeight = 48;
  const mobileSidebarMinHeight = 400; // Added minimum height for mobile sidebar

  // Close sidebar automatically on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Initial search when language changes
  useEffect(() => {
    handleSearch();
  }, [lang]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const generateReport = async (params) => {
    try {
      // Combine default report parameters with search parameters and language
      const allParams = {
        Lang: lang,
        ...reportParams,
        ...params,
      };

      const response = await reportApiService.post(
        "report/generate",
        allParams
      );

      // Get the response as a blob (PDF)
      const blob = await response.blob();

      // If blob is empty or too small to be a valid PDF
      if (blob.size === 0 || blob.size < 100) {
        return { url: null, hasContent: false };
      }

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      return { url: blobUrl, hasContent: true };
    } catch (err) {
      console.error("Error generating report:", err);
      return { url: null, hasContent: false, error: err.message };
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setNoResults(false);

    const {
      url,
      hasContent,
      error: reportError,
    } = await generateReport(searchParams);

    if (hasContent && url) {
      setReportUrl(url);
      setNoResults(false);
      onSearch(searchParams);
    } else {
      // Clear any previous report URL
      if (reportUrl && reportUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reportUrl);
      }
      setReportUrl("");
      setNoResults(true);

      if (reportError) {
        setError(`Error: ${reportError}`);
      }
    }

    setLoading(false);

    // Close sidebar on mobile after search
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Function to be passed to children to update search params
  const updateSearchParams = (newParams) => {
    setSearchParams((prev) => ({ ...prev, ...newParams }));
  };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (reportUrl && reportUrl.startsWith("blob:")) {
        URL.revokeObjectURL(reportUrl);
      }
    };
  }, [reportUrl]);

  // No Results message component
  const NoResultsMessage = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        backgroundColor: theme.palette.background.default,
        borderRadius: 1,
        p: 3,
      }}
    >
      <DescriptionOutlined
        sx={{
          fontSize: 64,
          color: theme.palette.text.secondary,
          opacity: 0.5,
          mb: 2,
        }}
      />
      <Typography
        variant="h5"
        color="textSecondary"
        align="center"
        sx={{ mb: 1 }}
      >
        No Results Found
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        align="center"
        sx={{ maxWidth: 400 }}
      ></Typography>
    </Box>
  );

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
          minHeight: isMobile && sidebarOpen ? mobileSidebarMinHeight : 0, // Added minimum height
          maxHeight: isMobile && sidebarOpen ? "60vh" : "100%", // Added maximum height constraint
          display: isMobile && !sidebarOpen ? "none" : "flex",
          transition: isMobile
            ? "height 0.3s ease-in-out"
            : "width 0.3s ease-in-out",
          overflow: "auto", // Changed from "hidden" to "auto" to allow scrolling if content is larger
          borderRadius: 0,
          position: "relative",
          zIndex: 10,
          flexDirection: "column",
          marginRight: isMobile ? 0 : sidebarOpen ? margnBetween : 0,
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
            paddingBottom: isMobile ? 4 : 2, // Extra padding at bottom for mobile
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
            sx={{ mt: 1, mb: isMobile ? 2 : 0 }} // Added bottom margin for mobile
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
          marginTop: isMobile ? margnBetween : 0,
        }}
      >
        {error && (
          <Typography color="error" sx={{ p: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

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
        ) : noResults ? (
          <NoResultsMessage />
        ) : reportUrl ? (
          <iframe
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
        ) : null}
      </Box>
    </Box>
  );
};

ReportViewerV2.propTypes = {
  reportApiBaseUrl: PropTypes.string.isRequired,
  reportParams: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  initialOpen: PropTypes.bool,
  onSearch: PropTypes.func,
};

export default MyReportViewerV2;
