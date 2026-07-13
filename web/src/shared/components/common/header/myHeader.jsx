/* eslint-disable react/prop-types */
import { Box, Typography, useTheme, Alert } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

const MyHeader = ({ title, subTitle, isDashboard = false }) => {
  const theme = useTheme();
  return (
    <Box mb={isDashboard ? 2 : 4}>
      <Typography
        sx={{
          color: theme.palette.info.light,
          fontWeight: "bold",
        }}
        variant="h5"
      >
        {title}
      </Typography>
      <Typography variant="body1">{subTitle}</Typography>
      {isDashboard && (
        <Box mt={1}>
          <Alert
            icon={<ConstructionIcon fontSize="inherit" />}
            severity="warning"
            variant="outlined"
            sx={{
              alignItems: "center",
              py: 0.5,
              "& .MuiAlert-message": { p: 0 },
            }}
          >
            This dashboard is under construction using dummy data. Updates will roll out step by step.
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default MyHeader;
