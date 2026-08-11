import { Box } from "@mui/material";
import { lazy, Suspense } from "react";
import type { SocialLoginHandler } from "../types";
import GoogleLoginButton from "./GoogleLoginButton";

const GoogleSocialLoginControl = lazy(() => import("./GoogleSocialLoginControl"));

interface SocialLoginButtonsProps {
  handleSocialLogin: SocialLoginHandler;
  isDarkMode: boolean;
  loading: boolean;
  disabled: boolean;
}

const SocialLoginButtons = ({
  handleSocialLogin,
  isDarkMode,
  loading,
  disabled,
}: SocialLoginButtonsProps) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Suspense
        fallback={(
          <GoogleLoginButton
            isDarkMode={isDarkMode}
            disabled
          />
        )}
      >
        <GoogleSocialLoginControl
          handleSocialLogin={handleSocialLogin}
          isDarkMode={isDarkMode}
          disabled={loading || disabled}
        />
      </Suspense>
    </Box>
  );
};

export default SocialLoginButtons;
