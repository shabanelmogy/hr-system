import { Box, CircularProgress } from "@mui/material";

const MySimpleLoader = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
      <CircularProgress />
    </Box>
  );
};

export default MySimpleLoader;
