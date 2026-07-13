import { appRoutes } from "@/routes/appRoutes";
import {
  Container,
  Grid,
  Paper,
  TextField,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";

// Components
import LeftPanel from "./components/leftPanel";
import LoginForm from "./components/loginForm";

// Custom hook for login logic
import { MySimpleDialog } from "@/shared/components";
import useLoginForm from "./hooks/useLoginForm";

const Login = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // API settings dialog state
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const [apiSettings, setApiSettings] = useState({
    baseApiUrl: localStorage.getItem("baseApiUrl") || "",
    reportApiUrl: localStorage.getItem("reportApiUrl") || "",
    reportApiKey: localStorage.getItem("reportApiKey") || "",
  });

  // Get all form-related props and handlers from custom hook
  const {
    t,
    loading,
    showPassword,
    setShowPassword,
    userNameRef,
    handleSubmit,
    onSubmit,
    control,
    reset,
    register,
    errors,
    handleSocialLogin,
    SnackbarComponent,
    setValue,
  } = useLoginForm();

  // Handle dialog open/close
  const handleOpenApiDialog = () => setApiDialogOpen(true);
  const handleCloseApiDialog = () => setApiDialogOpen(false);

  // Handle API settings input changes
  const handleApiSettingChange = (e: any) => {
    const { name, value } = e.target;
    setApiSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save API settings to localStorage
  const saveApiSettings = () => {
    localStorage.setItem("baseApiUrl", apiSettings.baseApiUrl);
    localStorage.setItem("reportApiUrl", apiSettings.reportApiUrl);
    handleCloseApiDialog();
    window.location.reload();
  };

  return (
    <>
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 2, sm: 8, md: 7 },
          mb: { xs: 2, sm: 2 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={12}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
            minHeight: { xs: "auto", sm: "auto" },
            maxHeight: { md: "600px" },
          }}
        >
          {/* Left Panel - Branding */}
          <LeftPanel t={t} />

          {/* Right Panel - Login Form */}
          <LoginForm
            t={t}
            theme={theme}
            isDarkMode={isDarkMode}
            userNameRef={userNameRef}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            loading={loading}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            control={control}
            errors={errors}
            register={register}
            handleSocialLogin={handleSocialLogin}
            reset={reset}
            appRoutes={appRoutes}
            setValue={setValue}
            onOpenApiSettings={handleOpenApiDialog}
          />
        </Paper>
      </Container>

      {/* API Settings Dialog */}
      <MySimpleDialog
        open={apiDialogOpen}
        onClose={handleCloseApiDialog}
        title={t("general.connectionSettings")}
        cancelText={t("actions.cancel")}
        confirmText={t("actions.save")}
        onConfirm={saveApiSettings}
        actions={null}
        slotProps={{}}
        paperProps={{
          sx: {
            borderRadius: 2,
            width: { xs: "90%", sm: "500px" },
          },
        }}
      >
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Base API URL"
              name="baseApiUrl"
              value={apiSettings.baseApiUrl.trim()}
              onChange={handleApiSettingChange}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Report API URL"
              name="reportApiUrl"
              value={apiSettings.reportApiUrl.trim()}
              onChange={handleApiSettingChange}
              variant="outlined"
              autoComplete="off"
            />
          </Grid>
        </Grid>
      </MySimpleDialog>
      {SnackbarComponent}
    </>
  );
};

export default Login;
