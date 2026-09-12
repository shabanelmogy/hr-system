import React from "react";
import { Alert, CircularProgress, Chip, Fade } from "@mui/material";
import { Timer as TimerIcon } from "@mui/icons-material";

interface LoadingAlertProps {
  loading: boolean;
  loadingText: string;
  showCounter: boolean;
  elapsedTime: string;
}

const LoadingAlert: React.FC<LoadingAlertProps> = ({
  loading,
  loadingText,
  showCounter,
  elapsedTime,
}) => {
  if (!loading) return null;

  return (
    <Fade in={true}>
      <Alert
        severity="info"
        icon={<CircularProgress size={20} />}
        sx={{ mb: 3 }}
      >
        {loadingText}
        {showCounter && (
          <Chip
            size="small"
            icon={<TimerIcon />}
            label={elapsedTime}
            sx={{ ml: 2 }}
          />
        )}
      </Alert>
    </Fade>
  );
};

export default LoadingAlert;
