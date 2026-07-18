import { Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface MyButtonProps extends ButtonProps {
  loading?: boolean;
  gradientColors?: readonly string[];
  hoverColors?: readonly string[];
}

const MyButton = ({
  children,
  loading = false,
  variant = "contained",
  gradientColors = ["#2575fc", "#6a11cb"],
  hoverColors = ["#1e5ed6", "#5a0cb0"],
  fullWidth = false,
  size = "large",
  type = "button",
  disabled = false,
  onClick,
  sx,
  ...otherProps
}: MyButtonProps) => {
  const startColor = gradientColors[0] ?? "#2575fc";
  const endColor = gradientColors[1] ?? startColor;
  const hoverStartColor = hoverColors[0] ?? "#1e5ed6";
  const hoverEndColor = hoverColors[1] ?? hoverStartColor;
  const buttonStyle = {
    color: "#fff",
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
