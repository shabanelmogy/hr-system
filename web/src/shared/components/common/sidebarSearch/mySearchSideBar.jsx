/* eslint-disable react/prop-types */
import Grid from "@mui/material/Grid";
import { Card, CardContent, Typography, useTheme } from "@mui/material";

export default function MySearchSideBar({
  open = false, // Default prop
  loading,
  children,
  top,
  heightOffset = "200px",
  sx = {},
}) {
  const theme = useTheme();

  return (
    <Grid size={{ xs: 12, md: 3 }}>
      <Card
        elevation={3}
        sx={{
          position: { xs: "static", md: "fixed" },
          top: { md: top },
          left: { md: open ? 250 : 80 },
          width: { xs: "100%", md: "25%" },
          maxWidth: { md: "350px" }, // Simplified
          zIndex: { md: 1100 },
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: { md: `calc(100vh - ${heightOffset})` }, // Use parameter
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          mt: { xs: 0, md: 0 },
          transition: "left 0.3s ease-in-out",
          ...sx,
        }}
      >
        {loading ? (
          <CardContent>
            <Typography>Loading...</Typography>
          </CardContent>
        ) : (
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              flexGrow: 1,
              overflow: "auto",
            }}
            role="region"
            aria-label="Search filters"
          >
            {children}
          </CardContent>
        )}
      </Card>
    </Grid>
  );
}
