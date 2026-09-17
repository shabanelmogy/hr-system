"use client";

import { appRoutes } from "@/config/routes";
import {
  Container,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import { lazy, Suspense, useEffect } from "react";

// Components
import LeftPanel from "./components/LeftPanel";
import LoginForm from "./components/LoginForm";

import useLoginForm from "./hooks/useLoginForm";

const TenantSelectionDialog = lazy(() => import("./components/TenantSelectionDialog"));
const CompanySelectionDialog = lazy(() => import("./components/CompanySelectionDialog"));

const Login = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  // Auth logout already clears any loaded role store through its own logout
  // listener. Avoid importing the role-management graph into the login route.
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
    isFormSubmitting,
    isSubmittingState,
    showPassword,
    setShowPassword,
    userNameRef,
    handleSubmit,
    onSubmit,
    loginAs,
    control,
    register,
    errors,
    handleSocialLogin,
    SnackbarComponent,
    companySelection,
    isSelectingCompany,
    selectCompany,
    cancelCompanySelection,
    tenantSelection,
    isSelectingTenant,
    selectTenant,
    cancelTenantSelection,
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
            flexDirection: { xs: "column", md: "row" },
            boxShadow: `0 10px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
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
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
            loginAs={loginAs}
            isFormSubmitting={isFormSubmitting}
            loading={isSubmittingState}
            control={control}
            errors={errors}
            register={register}
            handleSocialLogin={handleSocialLogin}
            appRoutes={appRoutes}
          />
        </Paper>
      </Container>
      {tenantSelection && (
        <Suspense fallback={null}>
          <TenantSelectionDialog
            selection={tenantSelection}
            loading={isSelectingTenant}
            onSelect={selectTenant}
            onCancel={cancelTenantSelection}
          />
        </Suspense>
      )}
      {companySelection && (
        <Suspense fallback={null}>
          <CompanySelectionDialog
            selection={companySelection}
            loading={isSelectingCompany}
            onSelect={selectCompany}
            onCancel={cancelCompanySelection}
          />
        </Suspense>
      )}
      {SnackbarComponent}
    </>
  );
};

export default Login;
