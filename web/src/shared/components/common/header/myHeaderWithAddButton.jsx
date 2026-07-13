// HeaderWithAddButton.jsx
/* eslint-disable react/prop-types */
import { Typography, Button, Card, CardContent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { useSidebar } from "../../../../layouts/components/sidebar/sidebarContext";

const MyHeaderWithAddButton = ({
  setAddDialogOpen,
  loading,
  isEdit,
  buttonAddText,
  headerTitle = "Add New Item",
  title,
  subTitle,
  showAddButton = true,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // True if screen width <= 599.95px
  const { open } = useSidebar();

  return (
    <Card
      elevation={3}
      sx={{
        position: { md: "fixed" },
        top: 80, // Below header
        right: 30,
        left: { md: open ? 250 : 80 },
        mx: "auto",
        mb: 3,
        mt: { xs: -3, md: 0 },
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
        }}
      >
        <div>
          <Typography
            variant={isXs ? "body2" : "h6"}
            sx={{
              fontWeight: "bold",
              color: theme.palette.info.light,
              textAlign: "left",
            }}
          >
            {title || headerTitle}
          </Typography>
          {subTitle && (
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: "left",
                mt: 0.5,
              }}
            >
              {subTitle}
            </Typography>
          )}
        </div>
        
        {showAddButton && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setAddDialogOpen && setAddDialogOpen(true)}
            disabled={loading || isEdit}
            sx={{
              borderRadius: 1,
              textTransform: "none",
              px: 3,
              boxShadow: `0 2px 4px ${theme.palette.grey[500]}33`,
              "&:hover": {
                boxShadow: `0 4px 8px ${theme.palette.grey[500]}66`,
              },
            }}
          >
            {buttonAddText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MyHeaderWithAddButton;