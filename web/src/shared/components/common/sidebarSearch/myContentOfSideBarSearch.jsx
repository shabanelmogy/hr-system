/* eslint-disable react/prop-types */
import Grid from "@mui/material/Grid";

export default function MyContentOfSideBarSearch({
  isBetween,
  children,
  heightOffset = "200px",
}) {
  return (
    <Grid
      size={{ xs: 12, md: 9 }}
      sx={{
        ml: { md: "30%", xl: "0%" },
        minHeight: `calc(100vh - ${heightOffset})`,
        mt: isBetween ? 1 : 5, // Proper conditional styling
      }}
    >
      {children}
    </Grid>
  );
}
