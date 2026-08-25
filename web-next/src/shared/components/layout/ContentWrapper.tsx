import { Box } from "@mui/material";
import type { ReactNode } from "react";

interface ContentWrapperProps {
  children: ReactNode;
  fillAvailable?: boolean;
}

const ContentWrapper = ({ children, fillAvailable = false }: ContentWrapperProps) => {
  return (
    <Box
      sx={{
        borderRadius: 2,
        zIndex: 1,
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        ...(fillAvailable && {
          display: "flex",
          flex: 1,
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }),
        ...(!fillAvailable && { overflowX: "auto" }),
        transform: "translateZ(0)",
        "& > *": { minWidth: fillAvailable ? 0 : "fit-content" },
      }}
    >
      {children}
    </Box>
  );
};

export default ContentWrapper;
