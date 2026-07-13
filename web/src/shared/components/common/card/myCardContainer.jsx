/* eslint-disable react/prop-types */
import { Paper } from "@mui/material";

const MyCardContainer = ({
  id,
  isSelected,
  onClick,
  elementRef,
  bgColor,
  children,
}) => {
  return (
    <Paper
      elevation={isSelected ? 4 : 1}
      ref={(el) => (elementRef.current[id] = el)}
      onClick={onClick}
      sx={{
        mb: 2,
        overflow: "hidden",
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        transform: isSelected ? "translateY(-2px)" : "none",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
        bgcolor: bgColor,
        border: isSelected ? 2 : 0,
        borderColor: "primary.main",
      }}
    >
      {children}
    </Paper>
  );
};

export default MyCardContainer;
