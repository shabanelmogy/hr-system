const HandleApiError = (error, setSnackbar, severity = "error") => {
  const messages =
    error.errors?.length > 0
      ? error.errors
      : [error.message || "حدث خطأ أثناء العملية"];

  setSnackbar({ open: true, messages: messages.filter(Boolean), severity });
};

export default HandleApiError;
