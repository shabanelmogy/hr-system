import { Box } from "@mui/material";
import type { ReactNode } from "react";

const ContentWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        zIndex: 1,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        overflowX: "auto",
        transform: "translateZ(0)",
        "& > *": { minWidth: "fit-content" },
      }}
    >
      {children}
    </Box>
  );
};

export default ContentWrapper;
