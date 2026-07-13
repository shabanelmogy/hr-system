/* eslint-disable react/prop-types */
import { Box, Typography, Snackbar, Alert, AlertTitle } from "@mui/material";
import { useTranslation } from "react-i18next";

const MySnackbar = ({ open, setSnackbarState, snackbarState }) => {
  const { t } = useTranslation();

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert
        severity={snackbarState.severity || "info"}
        sx={{ width: "100%" }}
        onClose={() => setSnackbarState((prev) => ({ ...prev, open: false }))}
      >
        <AlertTitle>{snackbarState.title}</AlertTitle>
        <Box>
          {snackbarState.messages.map((message, index) => (
            <Typography key={index} variant="body2">
              {message}
            </Typography>
          ))}
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default MySnackbar;
