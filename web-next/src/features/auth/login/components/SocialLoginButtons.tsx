import GoogleIcon from "@mui/icons-material/Google";
import { Box, Button, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useGoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import type { SocialLoginHandler } from "../types";

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
  const theme = useTheme();
  const { t } = useTranslation();

  // Set up Google login
  const googleLogin = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      void handleSocialLogin("google", credentialResponse);
    },
    onError: () => { },
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Google Login Button */}
      <Button
        variant="outlined"
        fullWidth
        onClick={() => googleLogin()}
        disabled={loading || disabled}
        startIcon={<GoogleIcon />}
        sx={{
          textTransform: "none",
          py: 1,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          backgroundColor: isDarkMode
            ? alpha(theme.palette.grey[800], 0.3)
            : alpha(theme.palette.common.white, 0.9),
          "&:hover": {
            backgroundColor: isDarkMode
              ? alpha(theme.palette.grey[800], 0.5)
              : alpha(theme.palette.grey[100], 0.8),
            borderColor: theme.palette.divider,
          },
          "& .MuiButton-startIcon": {
            color: "#DB4437", // Google red color
          },
        }}
      >
        {t("googleAuth.googleLogin")}
      </Button>

      {/* Add your Facebook and Twitter buttons */}
    </Box>
  );
};

export default SocialLoginButtons;
