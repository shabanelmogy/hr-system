/* eslint-disable react/prop-types */
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Box, CircularProgress, Tooltip, useTheme } from "@mui/material";

interface VerificationBadgeProps {
  isVerified: boolean;
  isChecking: boolean;
  tooltip: string;
}

const VerificationBadge = ({ isVerified, isChecking, tooltip }: VerificationBadgeProps) => {
  const theme = useTheme();

  let icon;
  let color;
  let status;

  if (isChecking) {
    status = "checking";
    icon = <CircularProgress size={16} color="inherit" />;
    color = theme.palette.info.main;
  } else if (isVerified) {
    status = "verified";
    icon = <CheckCircleIcon fontSize="small" />;
    color = theme.palette.success.main;
  } else {
    status = "error";
    icon = <ErrorIcon fontSize="small" />;
    color = theme.palette.error.main;
  }

  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Box
        sx={{
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-status={status}
      >
        {icon}
      </Box>
    </Tooltip>
  );
};

export default VerificationBadge;
