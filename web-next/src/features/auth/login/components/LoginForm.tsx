import MyButton from "@/shared/components/forms/buttons/MyButton";
import MyTextField from "@/shared/components/forms/text-fields/MyTextField";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LoginIcon from "@mui/icons-material/Login";
import PersonIcon from "@mui/icons-material/Person";
import { alpha, Avatar, Box, Divider, Typography, type Theme } from "@mui/material";
import { useState, type Dispatch, type RefObject, type SetStateAction } from "react";
import Link from "next/link";
import { gradientIconStyle } from "@/theme/componentStyles";
import { publicSelfRegistrationEnabled } from "@/config/publicEnv";
import type { AppRoutes } from "@/config/routes";
import type { Translator } from "../../types";
import type { SocialLoginHandler } from "../types";
import type { LoginFormData } from "../validation/loginValidation";
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
} from "react-hook-form";
import SocialLoginButtons from "./SocialLoginButtons";
import DemoLoginSection, { type DemoRole } from "./DemoLoginSection";
import ServerUrlField from "./ServerUrlField";

interface LoginFormProps {
  t: Translator;
  theme: Theme;
  isDarkMode: boolean;
  userNameRef: RefObject<HTMLInputElement | null>;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
  loginAs: (role: "user" | "admin" | "superAdmin") => Promise<void>;
  control: Control<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  register: UseFormRegister<LoginFormData>;
  handleSocialLogin: SocialLoginHandler;
  appRoutes: AppRoutes;
  isFormSubmitting: boolean;
}

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
  appRoutes,
  isFormSubmitting,
}: LoginFormProps) => {
  const [activeButton, setActiveButton] = useState<"main" | DemoRole | null>(null);

  const isAnySubmitting = loading || isFormSubmitting || activeButton !== null;

  const wrappedSubmit = handleSubmit(async (data) => {
    setActiveButton("main");
    try {
      await onSubmit(data);
    } finally {
      setActiveButton(null);
    }
  });

  const handleDemoLogin = async (role: DemoRole) => {
    if (isAnySubmitting) return;
    setActiveButton(role);
    try {
      await loginAs(role);
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
          maxValue={50}
          counter
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

        {/* Demo quick access panel */}
        <DemoLoginSection
          t={t}
          theme={theme}
          isDarkMode={isDarkMode}
          disabled={isAnySubmitting}
          activeRole={activeButton !== "main" ? activeButton : null}
          onLoginAs={handleDemoLogin}
        />
      </form>
      {/* Social Login Section */}
      <DividerWithText t={t} />
      <SocialLoginButtons
        handleSocialLogin={handleSocialLogin}
        isDarkMode={isDarkMode}
        loading={false}
        disabled={isAnySubmitting}
      />
      <ServerUrlField isDarkMode={isDarkMode} />
      {publicSelfRegistrationEnabled && (
        <Box sx={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", mt: 2, pb: 1 }}>
          <RegisterLink t={t} theme={theme} appRoutes={appRoutes} />
        </Box>
      )}
    </Box>
  );
};

/**
 * FormHeader component
 * Displays the login form header with icon and title
 */
const FormHeader = ({ t, theme }: { t: Translator; theme: Theme }) => (
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
const ForgotPasswordLink = ({
  t,
  theme,
  appRoutes,
}: {
  t: Translator;
  theme: Theme;
  appRoutes: AppRoutes;
}) => (
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
const LoginButton = ({
  t,
  loading,
  disabled,
}: {
  t: Translator;
  loading: boolean;
  disabled: boolean;
}) => (
  <MyButton type="submit" fullWidth loading={loading} disabled={disabled} startIcon={<LoginIcon />}>
    {t("auth.login")}
  </MyButton>
);

/**
 * DividerWithText component
 * Displays a divider with text "or continue with"
 */
const DividerWithText = ({ t }: { t: Translator }) => (
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
const RegisterLink = ({
  t,
  theme,
  appRoutes,
}: {
  t: Translator;
  theme: Theme;
  appRoutes: AppRoutes;
}) => (
  <Typography variant="body2">
    {t("auth.dontHaveAccount")}{" "}
    <Link
      href={appRoutes.register}
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
