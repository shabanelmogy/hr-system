import React from 'react';
import { Box, IconButton, Toolbar as MuiToolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { MyTextField } from '@/shared/components/forms';
import BackButton from '@/shared/components/navigation/BackButton';
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
          <MyTextField
            containerSx={{ ml: 2, width: 250 }}
            counter={false}
            fieldName="textViewerSearch"
            labelKey={null}
            margin="none"
            maxValue={200}
            size="small"
            placeholder={t("files.searchInText")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {!isMd && (
          <>
            <Tooltip title={t("common.search")}>
              <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.fontSizeDown")}>
              <IconButton onClick={onFontDec} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextDecreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.fontSizeUp")}>
              <IconButton onClick={onFontInc} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextIncreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? t("general.lightMode") : t("general.darkMode")}>
              <IconButton onClick={onToggleTheme} size="small" sx={{ bgcolor: 'action.hover' }}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.refresh")}>
              <IconButton onClick={onRefresh} size="small" sx={{ bgcolor: 'action.hover' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.share")}>
              <IconButton onClick={onShare} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("common.info")}>
              <IconButton onClick={onInfo} size="small" sx={{ bgcolor: 'action.hover' }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isMd && !isSm && (
          <>
            <Tooltip title={t("common.search")}>
              <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.fontSizeDown")}>
              <IconButton onClick={onFontDec} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextDecreaseIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.fontSizeUp")}>
              <IconButton onClick={onFontInc} size="small" sx={{ bgcolor: 'action.hover' }}>
                <TextIncreaseIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {isSm && !isXs && (
          <Tooltip title={t("common.search")}>
            <IconButton onClick={onToggleSearch} size="small" sx={{ bgcolor: showSearch ? 'primary.main' : 'action.hover', color: showSearch ? 'white' : 'inherit' }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={copied ? t("common.copied") : t("common.copyClipboard")}>
          <IconButton onClick={onCopy} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
            <CopyIcon />
          </IconButton>
        </Tooltip>

        {!isXs && (
          <>
            <Tooltip title={t("files.print")}>
              <IconButton onClick={onPrint} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("files.download")}>
              <IconButton onClick={onDownload} size="small" disabled={loading || hasError} sx={{ bgcolor: 'action.hover' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </>
        )}

        {(isMd || isSm || isXs) && (
          <Tooltip title={t("files.more")}>
            <IconButton size="small" onClick={(e) => onOpenMenu(e.currentTarget)} sx={{ bgcolor: 'action.hover' }}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        )}

        {isXs && (
          <Tooltip title={t("files.download")}>
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
