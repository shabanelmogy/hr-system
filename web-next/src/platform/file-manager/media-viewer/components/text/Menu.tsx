import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import {
  Search as SearchIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Refresh as RefreshIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export interface TextMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  darkMode: boolean;
  onClose: () => void;
  onToggleSearch: () => void;
  onFontDec: () => void;
  onFontInc: () => void;
  onToggleTheme: () => void;
  onRefresh: () => void;
  onShare: () => void;
  onInfo: () => void;
  onPrint: () => void;
}

const TextMenu: React.FC<TextMenuProps> = ({ anchorEl, open, onClose, isXs, isSm, isMd, darkMode, onToggleSearch, onFontDec, onFontInc, onToggleTheme, onRefresh, onShare, onInfo, onPrint }) => {
  const { t } = useTranslation();
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {isXs && (
        <>
          <MenuItem onClick={() => { onToggleSearch(); onClose(); }}>
            <SearchIcon sx={{ mr: 1 }} /> {t("common.search")}
          </MenuItem>
          <MenuItem onClick={() => { onFontDec(); onClose(); }}>
            <TextDecreaseIcon sx={{ mr: 1 }} /> {t("files.fontSizeDown")}
          </MenuItem>
          <MenuItem onClick={() => { onFontInc(); onClose(); }}>
            <TextIncreaseIcon sx={{ mr: 1 }} /> {t("files.fontSizeUp")}
          </MenuItem>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? t("general.lightMode") : t("general.darkMode")}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> {t("files.refresh")}
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> {t("common.share")}
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> {t("common.info")}
          </MenuItem>
          <MenuItem onClick={() => { onPrint(); onClose(); }}>
            <PrintIcon sx={{ mr: 1 }} /> {t("files.print")}
          </MenuItem>
        </>
      )}

      {isSm && !isXs && (
        <>
          <MenuItem onClick={() => { onFontDec(); onClose(); }}>
            <TextDecreaseIcon sx={{ mr: 1 }} /> {t("files.fontSizeDown")}
          </MenuItem>
          <MenuItem onClick={() => { onFontInc(); onClose(); }}>
            <TextIncreaseIcon sx={{ mr: 1 }} /> {t("files.fontSizeUp")}
          </MenuItem>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? t("general.lightMode") : t("general.darkMode")}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> {t("files.refresh")}
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> {t("common.share")}
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> {t("common.info")}
          </MenuItem>
        </>
      )}

      {isMd && !isSm && (
        <>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? t("general.lightMode") : t("general.darkMode")}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> {t("files.refresh")}
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> {t("common.share")}
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> {t("common.info")}
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default TextMenu;
