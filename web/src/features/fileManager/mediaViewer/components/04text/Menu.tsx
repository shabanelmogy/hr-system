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
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {isXs && (
        <>
          <MenuItem onClick={() => { onToggleSearch(); onClose(); }}>
            <SearchIcon sx={{ mr: 1 }} /> Search
          </MenuItem>
          <MenuItem onClick={() => { onFontDec(); onClose(); }}>
            <TextDecreaseIcon sx={{ mr: 1 }} /> Font Size -
          </MenuItem>
          <MenuItem onClick={() => { onFontInc(); onClose(); }}>
            <TextIncreaseIcon sx={{ mr: 1 }} /> Font Size +
          </MenuItem>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> Refresh
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> Info
          </MenuItem>
          <MenuItem onClick={() => { onPrint(); onClose(); }}>
            <PrintIcon sx={{ mr: 1 }} /> Print
          </MenuItem>
        </>
      )}

      {isSm && !isXs && (
        <>
          <MenuItem onClick={() => { onFontDec(); onClose(); }}>
            <TextDecreaseIcon sx={{ mr: 1 }} /> Font Size -
          </MenuItem>
          <MenuItem onClick={() => { onFontInc(); onClose(); }}>
            <TextIncreaseIcon sx={{ mr: 1 }} /> Font Size +
          </MenuItem>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> Refresh
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> Info
          </MenuItem>
        </>
      )}

      {isMd && !isSm && (
        <>
          <MenuItem onClick={() => { onToggleTheme(); onClose(); }}>
            {darkMode ? <LightModeIcon sx={{ mr: 1 }} /> : <DarkModeIcon sx={{ mr: 1 }} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </MenuItem>
          <MenuItem onClick={() => { onRefresh(); onClose(); }}>
            <RefreshIcon sx={{ mr: 1 }} /> Refresh
          </MenuItem>
          <MenuItem onClick={() => { onShare(); onClose(); }}>
            <ShareIcon sx={{ mr: 1 }} /> Share
          </MenuItem>
          <MenuItem onClick={() => { onInfo(); onClose(); }}>
            <InfoIcon sx={{ mr: 1 }} /> Info
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default TextMenu;
