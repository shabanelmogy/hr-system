// src/components/ui/LoadingIndicator.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  useTheme,
  Fade,
  Paper,
} from "@mui/material";

export const MyLoadingIndicator = ({
  isLoading = true,
  onLoadingComplete = null,
  message = "Preparing your components...",
  autoHide = false,
  duration = 6000, // Time in ms before auto-hiding (if autoHide is true)
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState("");
  const [visible, setVisible] = useState(isLoading);

  // Handle visibility based on isLoading prop
  useEffect(() => {
    setVisible(isLoading);
    if (isLoading) {
      setProgress(0); // Reset progress when shown again
    }
  }, [isLoading]);

  // Auto-hide functionality
  useEffect(() => {
    let hideTimer;
    if (autoHide && isLoading) {
      hideTimer = setTimeout(() => {
        setVisible(false);
        if (onLoadingComplete) onLoadingComplete();
      }, duration);
    }
    return () => clearTimeout(hideTimer);
  }, [autoHide, isLoading, onLoadingComplete, duration]);

  // Animated progress simulation
  useEffect(() => {
    let timer;
    if (visible) {
      timer = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 5;

          // If we reach 100% and not using autoHide
          if (newProgress >= 100) {
            clearInterval(timer);
            if (onLoadingComplete && !autoHide) {
              setTimeout(() => {
                setVisible(false);
                onLoadingComplete();
              }, 500); // Show 100% briefly before hiding
            }
            return 100;
          }
          return newProgress;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [visible, onLoadingComplete, autoHide]);

  // Animated dots for loading text
  useEffect(() => {
    let dotTimer;
    if (visible) {
      dotTimer = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
      }, 500);
    }
    return () => clearInterval(dotTimer);
  }, [visible]);

  // Don't render anything if not visible
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(6px)",
        zIndex: theme.zIndex.modal + 1,
      }}
    >
      <Fade in={visible} timeout={800}>
        <Paper
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 5,
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            width: 320,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, 
                ${theme.palette.primary.main}, 
                ${theme.palette.secondary.main}, 
                ${theme.palette.primary.main})`,
              backgroundSize: "200% 100%",
              animation: "gradient 2s linear infinite",
            },
            "@keyframes gradient": {
              "0%": { backgroundPosition: "0% 0%" },
              "100%": { backgroundPosition: "200% 0%" },
            },
          }}
        >
          {/* Pulsing outer ring */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 3,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 100,
                height: 100,
                borderRadius: "50%",
                backgroundColor: theme.palette.primary.light,
                opacity: 0.2,
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%": { transform: "scale(0.8)", opacity: 0.2 },
                  "50%": { transform: "scale(1.2)", opacity: 0.3 },
                  "100%": { transform: "scale(0.8)", opacity: 0.2 },
                },
              }}
            />

            {/* Background static circle */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={88}
              thickness={4}
              sx={{ color: theme.palette.grey[200], position: "absolute" }}
            />

            {/* Determinate progress */}
            <CircularProgress
              variant="determinate"
              value={progress}
              size={88}
              thickness={4}
              sx={{
                color: theme.palette.secondary.main,
                position: "absolute",
              }}
            />

            {/* Spinning indeterminate progress */}
            <CircularProgress
              size={88}
              thickness={4}
              sx={{
                color: theme.palette.primary.main,
                position: "absolute",
                opacity: 0.7,
              }}
            />

            {/* Center logo/icon area */}
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: `0 0 15px ${theme.palette.primary.main}`,
                zIndex: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              marginBottom: 1,
              minWidth: "120px", // Prevent layout shift with dots
            }}
          >
            {`Loading${dots}`}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {message}
          </Typography>

          {/* Animated accent line */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 3,
              width: `${progress}%`,
              backgroundColor: theme.palette.secondary.main,
              transition: "width 0.2s ease-in-out",
            }}
          />
        </Paper>
      </Fade>
    </Box>
  );
};

export default MyLoadingIndicator;
