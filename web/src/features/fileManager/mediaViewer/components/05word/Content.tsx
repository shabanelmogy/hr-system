import React, { useEffect, useRef, forwardRef } from "react";
import { Box, Typography } from "@mui/material";
import { renderAsync } from "docx-preview";

interface ContentProps {
  mediaUrl: string;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  onError: (msg: string) => void;
  onPagesDetected: (pages: number) => void;
}

const Content = forwardRef<HTMLDivElement, ContentProps>(({ mediaUrl, isLoading, setIsLoading, onError, onPagesDetected }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDocument = async () => {
      const container = containerRef.current;
      if (!container || !mediaUrl) return;

      try {
        setIsLoading(true);
        const response = await fetch(mediaUrl);
        const arrayBuffer = await response.arrayBuffer();

        await renderAsync(arrayBuffer, container, undefined, {
          className: "docx",
          inWrapper: true,
          breakPages: true,
          ignoreLastRenderedPageBreak: true,
          trimXmlDeclaration: true,
        });

        setTimeout(() => {
          const pages = container.querySelectorAll('.docx-wrapper section') || container.querySelectorAll('section');
          onPagesDetected(pages.length || 1);
        }, 500);

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading Word document:", error);
        onError("Failed to load Word document");
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [mediaUrl, setIsLoading, onError, onPagesDetected]);

  return (
    <Box sx={{ flex: 1, overflow: "auto", bgcolor: "background.default", p: 1 }}>
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Typography>Loading Word document...</Typography>
        </Box>
      )}
      <div ref={containerRef} />
    </Box>
  );
});

export default Content;
