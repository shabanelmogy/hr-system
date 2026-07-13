import React, { useEffect, useRef, useState } from "react";
import { Paper } from "@mui/material";
import { useSidebar } from "@/layouts/components/sidebar/sidebarContext";
import WordToolbar from "../05word/Toolbar";
import Content from "../05word/Content";

const docxStyles = `
  .docx { background: white; padding: 16px; font-family: 'Times New Roman', serif; line-height: 1.5; }
  .docx p { margin: 0 0 8px 0; }
  .docx table { border-collapse: collapse; width: 100%; }
  .docx td, .docx th { border: 1px solid #ddd; padding: 6px; }
  .docx-wrapper section { page-break-after: always; min-height: 100vh; padding: 16px; margin-bottom: 16px; border: 1px solid #ddd; background: white; }
`;

if (typeof document !== 'undefined' && !document.querySelector('#docx-styles')) {
  const style = document.createElement('style');
  style.id = 'docx-styles';
  style.textContent = docxStyles;
  document.head.appendChild(style);
}

interface WordViewerProps {
  mediaUrl: string;
  onError: (msg: string) => void;
  onBack?: () => void;
}

const WordViewer: React.FC<WordViewerProps> = ({ mediaUrl, onError, onBack }) => {
  const { open: sidebarOpen } = useSidebar();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = mediaUrl;
    a.download = "document.docx";
    a.click();
  };

  const handleFullscreen = () => document.getElementById("word-viewer")?.requestFullscreen?.();
  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };
  const handlePrint = () => window.print();

  useEffect(() => {
    if (!containerRef.current || totalPages <= 1) return;
    const pages = containerRef.current.querySelectorAll('.docx-wrapper section');
    pages.forEach((page, index) => {
      (page as HTMLElement).style.display = index + 1 === currentPage ? 'block' : 'none';
      if (index + 1 === currentPage) page.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [currentPage, totalPages]);

  return (
    <Paper
      id="word-viewer"
      elevation={2}
      sx={{
        width: sidebarOpen ? "calc(100vw - 275px)" : "calc(100vw - 90px)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <WordToolbar 
        onBack={handleBack} 
        onPrint={handlePrint} 
        onDownload={handleDownload} 
        onFullscreen={handleFullscreen}
        currentPage={currentPage}
        totalPages={totalPages}
        isLoading={isLoading}
        onFirst={() => setCurrentPage(1)}
        onPrev={() => setCurrentPage(p => Math.max(p - 1, 1))}
        onNext={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
        onLast={() => setCurrentPage(totalPages)}
      />
      <Content
        ref={containerRef}
        mediaUrl={mediaUrl}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onError={onError}
        onPagesDetected={setTotalPages}
      />
    </Paper>
  );
};

export default WordViewer;