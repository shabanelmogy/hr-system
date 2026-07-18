import { Box, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";

export interface MySimpleLoaderProps {
  label?: ReactNode;
}

const MySimpleLoader = ({ label = "Loading..." }: MySimpleLoaderProps) => {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={typeof label === "string" ? label : undefined}
      sx={{ display: "flex", justifyContent: "center", p: 5 }}
    >
      <CircularProgress aria-hidden="true" />
    </Box>
  );
};

export default MySimpleLoader;
