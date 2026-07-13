/* eslint-disable react/prop-types */
// components/CustomButton.jsx
import { Button, CircularProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";

const MyButton = ({
  children = undefined,
  loading = false,
  variant = "contained",
  gradientColors = ["#2575fc", "#6a11cb"],
  hoverColors = ["#1e5ed6", "#5a0cb0"],
  fullWidth = false,
  size = "large",
  type = "button",
  disabled = false,
  onClick = undefined,
  sx = {},
  ...otherProps
}) => {
  const buttonStyle = {
    color: "#fff",
    background: `linear-gradient(45deg, ${gradientColors[0]}, ${gradientColors[1]})`,
    "&:hover": {
      background: `linear-gradient(45deg, ${hoverColors[0]}, ${hoverColors[1]})`,
    },
    py: 1.2,
    fontWeight: "bold",
    fontSize: 16,
    boxShadow: `0 4px 12px ${alpha(gradientColors[0], 0.4)}`,
    borderRadius: 2,
    textTransform: "none",
    ...sx,
  };

  return (
    <Button
      type={type}
      variant={variant}
      fullWidth={fullWidth}
      size={size}
      sx={buttonStyle}
      disabled={disabled || loading}
      onClick={onClick}
      {...otherProps}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : children}
    </Button>
  );
};

export default MyButton;
