import { MyButton, MyTextField } from "@/shared/components/common";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { alpha, Avatar, Box, Divider, Typography } from "@mui/material";
import React, { useState } from "react";
import Link from "next/link";
import { gradientIconStyle } from "@/theme/componentStyles";
import SocialLoginButtons from "./SocialLoginButtons";

const LoginForm = ({
  t,
  theme,
  isDarkMode,
  userNameRef,
  showPassword,
  setShowPassword,
  loading,
  handleSubmit,
  onSubmit,
  loginAs,
  control,
  errors,
  register,
  handleSocialLogin,
  reset,
  appRoutes,
  isFormSubmitting,
}: {
  t: any;
  theme: any;
  isDarkMode: any;
  userNameRef: any;
  showPassword: any;
  setShowPassword: any;
  loading: boolean;
  handleSubmit: any;
  onSubmit: any;
  loginAs: (role: "user" | "admin") => Promise<void>;
  control: any;
  errors: any;
  register: any;
  handleSocialLogin: any;
  reset: any;
  appRoutes: any;
  isFormSubmitting: boolean;
}) => {
  const [activeButton, setActiveButton] = useState<"main" | "user" | "admin" | null>(null);

  const isAnySubmitting = loading || isFormSubmitting || activeButton !== null;

  const wrappedSubmit = handleSubmit(async (data: any) => {
    setActiveButton("main");
    try {
      await onSubmit(data);
    } finally {
      setActiveButton(null);
    }
  });

  const handleUserLogin = async () => {
    if (isAnySubmitting) return;
    setActiveButton("user");
    try {
      await loginAs("user");
    } finally {
      setActiveButton(null);
    }
  };

  const handleAdminLogin = async () => {
    if (isAnySubmitting) return;
    setActiveButton("admin");
    try {
      await loginAs("admin");
    } finally {
      setActiveButton(null);
    }
  };

  return (
    <Box
      sx={{
        flex: { xs: "1", md: "1 1 60%" },
        p: { xs: 2.5, sm: 3.5, md: 4 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: isDarkMode
          ? alpha(theme.palette.background.paper, 0.8)
          : alpha(theme.palette.grey[50], 0.8),
        backgroundImage: isDarkMode
          ? `radial-gradient(circle at 100% 100%, ${alpha(
            theme.palette.primary.dark,
            0.05
          )} 0%, transparent 60%)`
          : `radial-gradient(circle at 100% 100%, ${alpha(
            theme.palette.primary.light,
            0.08
          )} 0%, transparent 60%)`,
      }}
    >
      {/* Header Section */}
      <FormHeader t={t} theme={theme} />
      {/* Form Section */}
      <form onSubmit={wrappedSubmit}>
        <MyTextField
          fieldName="username"
          margin="normal"
          labelKey="auth.userName"
          control={control}
          inputRef={userNameRef}
          loading={false}
          errors={errors}
          register={register}
          fullWidth
          sx={{ mb: 1.5 }}
          showCounter={false}
          startIcon={<PersonIcon sx={{ ...gradientIconStyle }} />}
        />
        <MyTextField
          fieldName="password"
          labelKey="auth.password"
          type="password"
          control={control}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          errors={errors}
          fullWidth
          startIcon={<LockOutlinedIcon sx={{ ...gradientIconStyle }} />}
        />

        <ForgotPasswordLink t={t} theme={theme} appRoutes={appRoutes} />
        
        {/* Original login button */}
        <LoginButton t={t} loading={activeButton === "main"} disabled={isAnySubmitting} />
        
        {/* Quick login buttons in a row */}
        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 2 }}>
          <UserLoginButton t={t} loading={activeButton === "user"} onClick={handleUserLogin} disabled={isAnySubmitting} />
          <AdminLoginButton
            t={t}
            loading={activeButton === "admin"}
            onClick={handleAdminLogin}
            disabled={isAnySubmitting}
          />
        </Box>
      </form>
      {/* Social Login Section */}
      <DividerWithText t={t} />
      <SocialLoginButtons
        handleSocialLogin={handleSocialLogin}
        isDarkMode={isDarkMode}
        loading={false}
        disabled={isAnySubmitting}
      />
      <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", mt: 2, pb: 1 }}>
        {/* Register Link */}
        <RegisterLink t={t} theme={theme} reset={reset} appRoutes={appRoutes} />
      </Box>
    </Box>
  );
};

/**
 * FormHeader component
 * Displays the login form header with icon and title
 */
const FormHeader = ({ t, theme }: { t: any; theme: any }) => (
  <Box sx={{ textAlign: "center", mb: 2.5, mt: 1 }}>
    <Avatar
      sx={{
        mx: "auto",
        bgcolor: theme.palette.primary.main,
        width: 50,
        height: 50,
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <LockOutlinedIcon />
    </Avatar>
    <Typography variant="h5" sx={{ mt: 1.5, fontWeight: "bold" }}>
      {t("auth.signIn")}
    </Typography>
  </Box>
);

/**
 * ForgotPasswordLink component
 * Displays the forgot password link
 */
const ForgotPasswordLink = ({ t, theme, appRoutes }: { t: any; theme: any; appRoutes: any }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      mt: 1,
      mb: 2.5,
    }}
  >
    <Typography variant="body2">
      <Link
        href={appRoutes.forgetPassword}
        style={{
          textDecoration: "none",
          color: theme.palette.primary.main,
          fontWeight: 500,
          transition: "color 0.2s",
        }}
      >
        {t("auth.doYouForgetPassword")}
      </Link>
    </Typography>
  </Box>
);

/**
 * LoginButton component
 * Displays the login button with loading state
 */
const LoginButton = ({ t, loading, disabled }: { t: any; loading: any; disabled: any }) => (
  <MyButton type="submit" fullWidth loading={loading} disabled={disabled} startIcon={<LoginIcon />}>
    {t("auth.login")}
  </MyButton>
);

/**
 * UserLoginButton component
 * Displays the login as user button
 */
const UserLoginButton = ({ t, loading, onClick, disabled }: { t: any; loading: any; onClick: any; disabled: any }) => (
  <MyButton
    type="button"
    fullWidth
    loading={loading}
    onClick={onClick}
    size="medium"
    startIcon={<PersonIcon />}
    disabled={disabled}
  >
    {t("auth.loginAsUser")}
  </MyButton>
);

/**
 * AdminLoginButton component
 * Displays the login as admin button
 */
const AdminLoginButton = ({ t, loading, onClick, disabled }: { t: any; loading: any; onClick: any; disabled: any }) => (
  <MyButton
    type="button"
    fullWidth
    loading={loading}
    onClick={onClick}
    gradientColors={["#f44336", "#e91e63"]}
    hoverColors={["#d32f2f", "#c2185b"]}
    size="medium"
    startIcon={<AdminPanelSettingsIcon />}
    disabled={disabled}
  >
    {t("auth.loginAsAdmin")}
  </MyButton>
);

/**
 * DividerWithText component
 * Displays a divider with text "or continue with"
 */
const DividerWithText = ({ t }: { t: any }) => (
  <Box sx={{ my: 2, position: "relative", textAlign: "center" }}>
    <Divider>
      <Typography variant="body2" sx={{ color: "text.secondary", px: 1 }}>
        {t("googleAuth.orContinueWithGoogle")}
      </Typography>
    </Divider>
  </Box>
);

/**
 * RegisterLink component
 * Displays the link to register page
 */
const RegisterLink = ({ t, theme, reset, appRoutes }: { t: any; theme: any; reset: any; appRoutes: any }) => (
  <Typography variant="body2">
    {t("auth.dontHaveAccount")}{" "}
    <Link
      href={appRoutes.register}
      onClick={() => {
        reset();
      }}
      style={{
        textDecoration: "none",
        color: theme.palette.primary.main,
        fontWeight: "bold",
        transition: "color 0.2s",
      }}
    >
      {t("auth.register")}
    </Link>
  </Typography>
);

export default LoginForm;
