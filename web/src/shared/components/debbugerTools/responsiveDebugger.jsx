import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse,
} from "@mui/material";
import { ExpandMore, ExpandLess, Code } from "@mui/icons-material";

/**
 * ResponsiveDebugger - A component to show current viewport size and active breakpoints
 *
 * @param {Object} props
 * @param {string} [props.position="fixed"] - CSS position property for the debugger panel
 * @param {number} [props.zIndex=9999] - z-index for the debugger panel
 * @param {string} [props.bgColor="#1976d2"] - Background color of the debugger
 * @param {string} [props.textColor="#ffffff"] - Text color of the debugger
 * @param {boolean} [props.expanded=true] - Whether the debugger is initially expanded
 * @param {boolean} [props.showCodeHelpers=false] - Whether to show MUI code helpers
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const ResponsiveDebugger = ({
  position = "fixed",
  zIndex = 9999,
  bgColor = "#1976d2",
  textColor = "#ffffff",
  sx = {},
}) => {
  const theme = useTheme();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Media queries for all breakpoints
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const isSm = useMediaQuery(theme.breakpoints.only("sm"));
  const isMd = useMediaQuery(theme.breakpoints.only("md"));
  const isLg = useMediaQuery(theme.breakpoints.only("lg"));
  const isXl = useMediaQuery(theme.breakpoints.only("xl"));

  // Update window size on resize for debugging
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get the current active base breakpoint
  const getCurrentBreakpoint = () => {
    if (isXs) return "xs";
    if (isSm) return "sm";
    if (isMd) return "md";
    if (isLg) return "lg";
    if (isXl) return "xl";
    return "unknown";
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position,
        top: 16, // <-- moved from bottom
        right: 16,
        maxWidth: 400,
        zIndex,
        bgcolor: bgColor,
        color: textColor,
        borderRadius: 2,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
          cursor: "pointer",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          {windowSize.width} × {windowSize.height}px | {getCurrentBreakpoint()}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ResponsiveDebugger;

{
  /* Example For Use
  <ResponsiveDebugger
  position="fixed"
  bgColor="#1976d2"
/>; 
*/
}
