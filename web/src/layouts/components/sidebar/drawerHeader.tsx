import { styled, useTheme, IconButton, Collapse } from "@mui/material";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";

// Styled Drawer Header
const StyledDrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// Close button container
const CloseButtonContainer = styled("div")(({ theme }) => ({
  display: "flex",
  width: "100%",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0.5, 0),
}));

function DrawerHeader({ handleDrawerClose, anySectionExpanded = false }: {
  handleDrawerClose: () => void;
  anySectionExpanded?: boolean;
}) {
  const theme = useTheme();

  return (
    <StyledDrawerHeader>
      {/* Only show close button when no sections are expanded */}
      <Collapse in={!anySectionExpanded} timeout="auto">
        <CloseButtonContainer>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </CloseButtonContainer>
      </Collapse>
    </StyledDrawerHeader>
  );
}

export default DrawerHeader;
