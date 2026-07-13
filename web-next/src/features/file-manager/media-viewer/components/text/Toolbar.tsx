import React from 'react';
import { Box, IconButton, TextField, Toolbar as MuiToolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import BackButton from '@/shared/components/common/BackButton';
import {
  Search as SearchIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

export interface TextToolbarProps {
  fileName: string;
  onBack?: () => void;
  showSearch: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onToggleSearch: () => void;
  onFontInc: () => void;
  onFontDec: () => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  onRefresh: () => void;
  onShare: () => void;
  onInfo: () => void;
  onCopy: () => void;
  onPrint: () => void;
  onDownload: () => void;
  copied: boolean;
  loading: boolean;
  hasError: boolean;
  onOpenMenu: (el: HTMLElement) => void;
}

const TextToolbar: React.FC<TextToolbarProps> = (props) => {
  const {
    fileName,
    onBack,
    showSearch,
    searchTerm,
    setSearchTerm,
    onToggleSearch,
    onFontInc,
    onFontDec,
    darkMode,
    onToggleTheme,
    onRefresh,
    onShare,
    onInfo,
    onCopy,
    onPrint,
    onDownload,
    copied,
    loading,
    hasError,
    onOpenMenu,
  } = props;

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <MuiToolbar
      variant="dense"
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        minHeight: 40,
        mt: 5,
        px: 1,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
        {onBack && (
          <BackButton onClick={onBack} size="small" />
        )}
        <Typography variant="subtitle1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fileName}
        </Typography>
        {showSearch && (
          <TextField
            size="small"
            placeholder="Search in text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ ml: 2, width: 250 }}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {!isMd && (
          <>
            <Tooltip title="Search">
              <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Font Size -">
              <IconButton onClick={onFontDec} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextDecreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Font Size +">
              <IconButton onClick={onFontInc} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextIncreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              <IconButton onClick={onToggleTheme} size="small" sx={{ bgcolor: 'action.hover' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={onRefresh} size="small" sx={{ bgcolor: 'action.hover' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton onClick={onShare} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Info">
              <IconButton onClick={onInfo} size="small" sx={{ bgcolor: 'action.hover' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isMd && !isSm && (
          <>
            <Tooltip title="Search">
              <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Font Size -">
              <IconButton onClick={onFontDec} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextDecreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Font Size +">
              <IconButton onClick={onFontInc} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextIncreaseIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isSm && !isXs && (
          <Tooltip title="Search">
            <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton onClick={onCopy} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
            <CopyIcon />
          </IconButton>
        </Tooltip>

        {!isXs && (
          <>
            <Tooltip title="Print">
              <IconButton onClick={onPrint} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton onClick={onDownload} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {(isMd || isSm || isXs) && (
          <Tooltip title="More">
            <IconButton size="small" onClick={(e) => onOpenMenu(e.currentTarget)} sx={{ bgcolor: 'action.hover' }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        )}

        {isXs && (
          <Tooltip title="Download">
            <IconButton onClick={onDownload} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </MuiToolbar>
  );
};

export default TextToolbar;
