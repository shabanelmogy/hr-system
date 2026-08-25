import { Timer as TimerIcon } from "@mui/icons-material";
import { Alert, Chip, CircularProgress, Fade } from "@mui/material";

interface LoadingAlertProps {
  loading: boolean;
  loadingText: string;
  showCounter: boolean;
  elapsedTime: string;
}

const LoadingAlert = ({
  loading,
  loadingText,
  showCounter,
  elapsedTime,
}: LoadingAlertProps) => {
  if (!loading) return null;

  return (
    <Fade in>
      <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3 }}>
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
