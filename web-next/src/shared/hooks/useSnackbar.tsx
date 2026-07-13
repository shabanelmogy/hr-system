import { useState } from "react";
import MySnackbar from "../components/feedback/MySnackbar";

const useSnackbar = () => {
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    messages: [],
    severity: "info",
    title: "",
  });

  const showSnackbar = (severity: string, messages: any[], title = "") => {
    setSnackbarState({ open: true, severity, messages, title });
  };

  const closeSnackbar = () => {
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const SnackbarComponent = (
    <MySnackbar
      open={snackbarState.open}
      setSnackbarState={setSnackbarState}
      snackbarState={snackbarState}
    />
  );

  return { showSnackbar, SnackbarComponent, closeSnackbar };
};

export default useSnackbar;
