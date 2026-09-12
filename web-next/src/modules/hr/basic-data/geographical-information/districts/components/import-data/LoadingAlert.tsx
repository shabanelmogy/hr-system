import { Alert, CircularProgress, Chip, Fade } from "@mui/material";
import { Timer as TimerIcon } from "@mui/icons-material";

interface LoadingAlertProps {
  loading: boolean;
  loadingText: string;
  showCounter: boolean;
  elapsedTime: string;
}

export default function LoadingAlert({
  loading,
  loadingText,
  showCounter,
  elapsedTime,
}: LoadingAlertProps) {
  if (!loading) return null;

  return (
    <Fade in>
      <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ mb: 3 }}>
        {loadingText}
        {showCounter ? (
          <Chip size="small" icon={<TimerIcon />} label={elapsedTime} sx={{ ml: 2 }} />
        ) : null}
      </Alert>
    </Fade>
  );
}
