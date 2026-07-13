/* eslint-disable react/prop-types */
import { Box } from "@mui/material";

export default function MyItemCardWithLabel({
  label,
  isSelected,
  textColor,
  item,
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
      <Box
        sx={{
          fontWeight: "bold",
          minWidth: "120px",
          color: isSelected ? textColor : "primary.main",
        }}
      >
        {label}:
      </Box>
      <Box sx={{ color: textColor }}>{item}</Box>
    </Box>
  );
}
