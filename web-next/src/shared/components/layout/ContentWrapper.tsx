import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSidebar } from "@/shared/contexts/SidebarContext";

const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
  const { open } = useSidebar();
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsFirstRender(false));
    return () => cancelAnimationFrame(frame);
  }, []);

  const closedWidth = "calc(100vw - 100px)";
  const openWidth = "calc(100vw - 300px)";
  const mobileWidth = "calc(100vw - 50px)";

  return (
    <Box
      sx={{
        borderRadius: 2,
        zIndex: 1,
        boxSizing: "border-box",
        width: { xs: mobileWidth, md: open ? openWidth : closedWidth },
        maxWidth: "100%",
        overflowX: "auto",
        transform: "translateZ(0)",
        transition: isFirstRender ? "none" : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "& > *": { minWidth: "fit-content" },
      }}
    >
      {children}
    </Box>
  );
};

export default ContentWrapper;
