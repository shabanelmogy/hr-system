import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSidebar } from "./sidebar/sidebarContext";

const MyContentsWrapper = ({ children }: { children: React.ReactNode }) => {
  const { open } = useSidebar();
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Skip animation on first render
  useEffect(() => {
    // Use requestAnimationFrame to ensure we're past the first render
    requestAnimationFrame(() => {
      setIsFirstRender(false);
    });
  }, []);

  // Calculate widths
  const closedWidth = "calc(100vw - 100px)";
  const openWidth = "calc(100vw - 300px)";
  const mobileWidth = "calc(100vw - 50px)";

  return (
    <Box
      sx={{
        borderRadius: 2,
        zIndex: 1,
        boxSizing: "border-box",
        width: {
          xs: mobileWidth,
          md: open ? openWidth : closedWidth,
        },
        maxWidth: "100%",
        overflowX: "auto",
        transform: "translateZ(0)",
        // Skip transition on first render to avoid initial lag
        transition: isFirstRender
          ? "none"
          : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "& > *": {
          minWidth: "fit-content",
        },
      }}
    >
      {children}
    </Box>
  );
};

export default MyContentsWrapper;
