import GoogleIcon from "@mui/icons-material/Google";
import { Button, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

type GoogleLoginButtonProps = {
  isDarkMode: boolean;
  disabled: boolean;
  onClick?: () => void;
};

export default function GoogleLoginButton({
  isDarkMode,
  disabled,
  onClick,
}: GoogleLoginButtonProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={onClick}
      disabled={disabled}
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
        "& .MuiButton-startIcon": { color: "#DB4437" },
      }}
    >
      {t("googleAuth.googleLogin")}
    </Button>
  );
}
