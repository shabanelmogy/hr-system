// components/FileUpload/StyledComponents.js
import { styled } from "@mui/material/styles";
import { Box, Card } from "@mui/material";

export const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export const StyledCard = styled(Card)(({ theme }) => ({
  position: "relative",
  overflow: "visible",
  boxShadow: theme.shadows[3],
}));

export const StyledDropZone = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: theme.transitions.create(["border-color", "background-color"], {
    duration: theme.transitions.duration.short,
  }),
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
  "&.dragover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledComponents = {
  VisuallyHiddenInput,
  StyledCard,
  StyledDropZone,
};

export default StyledComponents;
