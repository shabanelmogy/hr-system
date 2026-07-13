import React, { useEffect, useState } from 'react';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useSidebar } from "@/shared/contexts/SidebarContext";
import TextToolbar from '../text/Toolbar';
import TextContent from '../text/Content';
import TextMenu from '../text/Menu';

interface TxtViewerProps {
  fileUrl: string;
  fileName?: string;
  onBack?: () => void;
  onError?: (message: string) => void;
}

export const TxtViewer: React.FC<TxtViewerProps> = ({ fileUrl, fileName = 'Text File', onBack, onError }) => {
  const { open: sidebarOpen } = useSidebar();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [darkMode, setDarkMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load text file';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileUrl, onError, reloadKey]);

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', fileUrl);
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.opener = null;
      const printDocument = printWindow.document;
      printDocument.title = fileName;

      const pre = printDocument.createElement('pre');
      pre.style.fontFamily = 'monospace';
      pre.style.whiteSpace = 'pre-wrap';
      pre.style.wordBreak = 'break-word';
      pre.textContent = content;
      printDocument.body.replaceChildren(pre);

      printWindow.focus();
      printWindow.print();
    }
  };

  const handleSearch = () => setShowSearch(!showSearch);

  const handleFontIncrease = () => setFontSize(prev => Math.min(prev + 2, 24));
  const handleFontDecrease = () => setFontSize(prev => Math.max(prev - 2, 10));

  const handleThemeToggle = () => setDarkMode(!darkMode);
  const handleRefresh = () => setReloadKey((value) => value + 1);
  const handleShare = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: fileName, url: currentUrl });
      } catch (err) {
        navigator.clipboard.writeText(currentUrl);
      }
    } else {
      navigator.clipboard.writeText(currentUrl);
    }
  };
  const handleInfo = () => setShowInfo(!showInfo);

  return (
    <Paper
      elevation={3}
      sx={{
        width: sidebarOpen ? "calc(100vw - 270px)" : "calc(100vw - 90px)",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <TextToolbar
        fileName={fileName}
        onBack={onBack}
        showSearch={showSearch}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onToggleSearch={handleSearch}
        onFontInc={handleFontIncrease}
        onFontDec={handleFontDecrease}
        darkMode={darkMode}
        onToggleTheme={handleThemeToggle}
        onRefresh={handleRefresh}
        onShare={handleShare}
        onInfo={handleInfo}
        onCopy={handleCopy}
        onPrint={handlePrint}
        onDownload={handleDownload}
        copied={copied}
        loading={loading}
        hasError={!!error}
        onOpenMenu={(el) => setMenuAnchor(el)}
      />

      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default', position: 'relative' }}>
        <TextContent
          loading={loading}
          error={error}
          content={content}
          searchTerm={searchTerm}
          fontSize={fontSize}
          darkMode={darkMode}
        />
      </Box>
      
      <TextMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        isXs={isXs}
        isSm={isSm}
        isMd={isMd}
        darkMode={darkMode}
        onToggleSearch={handleSearch}
        onFontDec={handleFontDecrease}
        onFontInc={handleFontIncrease}
        onToggleTheme={handleThemeToggle}
        onRefresh={handleRefresh}
        onShare={handleShare}
        onInfo={handleInfo}
        onPrint={handlePrint}
      />
    </Paper>
  );
};

export default TxtViewer;
