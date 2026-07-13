import React from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  Flip as FlipHIcon,
  SwapVert as FlipVIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface ImageMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  isFullscreen: boolean;
  onClose: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onFullscreen: () => void;
}

const ImageMenu: React.FC<ImageMenuProps> = ({
  anchorEl,
  open,
  isFullscreen,
  onClose,
  onFlipH,
  onFlipV,
  onFullscreen,
}) => {

  const { t } = useTranslation();

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem
        onClick={() => {
          onFlipH();
          onClose();
        }}
      >
        <FlipHIcon sx={{ mr: 1 }} /> Flip Horizontal
      </MenuItem>
      <MenuItem
        onClick={() => {
          onFlipV();
          onClose();
        }}
      >
        <FlipVIcon sx={{ mr: 1 }} /> Flip Vertical
      </MenuItem>
      <MenuItem
        onClick={() => {
          onFullscreen();
          onClose();
        }}
      >
        {isFullscreen ? (
          <FullscreenExitIcon sx={{ mr: 1 }} />
        ) : (
          <FullscreenIcon sx={{ mr: 1 }} />
        )}
        {isFullscreen ? t("files.exitFullscreen") : t("files.fullScreen")}
      </MenuItem>
    </Menu>
  );
};

export default ImageMenu;
