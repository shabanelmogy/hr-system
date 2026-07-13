/* eslint-disable react/prop-types */
import { Box, Chip, Typography } from "@mui/material";

export default function MyCardHeader({ isSelected, item, title }) {
  return (
    <Box
      sx={{
        bgcolor: isSelected ? "primary.main" : "primary.dark",
        color: "white",
        py: 1.5,
        px: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Typography variant="subtitle1" fontWeight="medium">
        {title}
      </Typography>
      <Chip
        label={`ID: ${item.id}`}
        size="small"
        sx={{
          bgcolor: "background.paper",
          color: "text.primary",
          fontWeight: "bold",
        }}
      />
    </Box>
  );
}
