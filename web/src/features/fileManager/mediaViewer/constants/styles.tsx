import styled from "@emotion/styled";
import { Box } from "@mui/system";

export const ControlsOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: "flex",
  gap: theme.spacing(1),
  zIndex: 10,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
}));

export const BackButtonOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 10,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5),
  boxShadow: theme.shadows[2],
}));

export const LoadingOverlay = styled(Box)({
  position: "absolute",
  top: 0,
  left: 0,
  zIndex: 20,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
});
