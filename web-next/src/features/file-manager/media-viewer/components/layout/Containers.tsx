import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Container = styled(Box)(({ theme }) => ({
  height: "calc(100vh - 120px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
  position: "relative",
  padding: theme.spacing(2),
}));

export const MediaContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  maxWidth: "100%",
  maxHeight: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& iframe": {
    border: "none",
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
  },
  "& img": {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    maxWidth: "100%",
    maxHeight: "90vh",
    objectFit: "contain",
  },
  "& video": {
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[4],
    maxWidth: "100%",
    maxHeight: "90vh",
  },
  "& audio": {
    width: "100%",
    maxWidth: "600px",
  },
}));
