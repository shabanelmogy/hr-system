"use client";

import { appRoutes } from "@/config/routes";
import {
  Container,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect } from "react";

// Components
import LeftPanel from "./components/LeftPanel";
import LoginForm from "./components/LoginForm";

import useLoginForm from "./hooks/useLoginForm";

const Login = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Clear session storage on login page mount (after logout)
  useEffect(() => {
    try {
      sessionStorage.clear();
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Get all form-related props and handlers from custom hook
  const {
    t,
    isSubmitting,
    showPassword,
    setShowPassword,
    userNameRef,
    handleSubmit,
    onSubmit,
    loginAs,
    control,
    reset,
    register,
    errors,
    handleSocialLogin,
    SnackbarComponent,
    setValue,
  } = useLoginForm();

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
            loading={isSubmitting.current}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            loginAs={loginAs}
            isSubmitting={isSubmitting}
            control={control}
            errors={errors}
            register={register}
            handleSocialLogin={handleSocialLogin}
            reset={reset}
            appRoutes={appRoutes}
            setValue={setValue}
          />
        </Paper>
      </Container>
      {SnackbarComponent}
    </>
  );
};

export default Login;
