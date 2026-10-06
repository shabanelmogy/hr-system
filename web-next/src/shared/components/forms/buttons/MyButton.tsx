import { Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

interface MyButtonProps extends ButtonProps {
  loading?: boolean;
  gradientColors?: readonly string[];
  hoverColors?: readonly string[];
}

const MyButton = ({
  children,
  loading = false,
  variant = "contained",
  gradientColors,
  hoverColors,
  fullWidth = false,
  size = "large",
  type = "button",
  disabled = false,
  onClick,
  sx,
  ...otherProps
}: MyButtonProps) => {
  const theme = useTheme();
  // Defaults follow the active palette (primary → primary.dark) instead of a fixed blue/purple.
  const gradient = gradientColors ?? [theme.palette.primary.main, theme.palette.primary.dark];
  const hover = hoverColors ?? [theme.palette.primary.dark, theme.palette.primary.dark];
  const startColor = gradient[0] ?? theme.palette.primary.main;
  const endColor = gradient[1] ?? startColor;
  const hoverStartColor = hover[0] ?? theme.palette.primary.dark;
  const hoverEndColor = hover[1] ?? hoverStartColor;
  const buttonStyle = {
    color: gradientColors ? "#fff" : theme.palette.primary.contrastText,
    background: `linear-gradient(45deg, ${startColor}, ${endColor})`,
    "&:hover": {
      background: `linear-gradient(45deg, ${hoverStartColor}, ${hoverEndColor})`,
    },
    py: 1.2,
    fontWeight: "bold",
    fontSize: 16,
    boxShadow: `0 4px 12px ${alpha(startColor, 0.4)}`,
    borderRadius: 2,
    textTransform: "none",
  };

  return (
    <Button
      type={type}
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      sx={[buttonStyle, ...(Array.isArray(sx) ? sx : [sx])]}
      disabled={disabled || loading}
      onClick={onClick}
      {...otherProps}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
};

export default MyButton;
