import React from "react";
import {Tooltip, IconButton, CircularProgress } from "@mui/material";
import {
  FullscreenExit as FullscreenExitIcon,
  Fullscreen as FullscreenIcon,
  FileDownload as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import { BackButtonOverlay, ControlsOverlay, LoadingOverlay } from "../../constants/styles";


export const BackOverlayButton: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  return (
    <BackButtonOverlay>
      <Tooltip title={t("media.backToFiles")}>
        <IconButton onClick={onBack} size="small" color="primary">
          {isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
        </IconButton>
      </Tooltip>
    </BackButtonOverlay>
  );
};


export const ViewerControls: React.FC<{
  onDownload: () => void;
  onToggleFullscreen: () => void;
  showFullscreen: boolean;
  isFullscreen: boolean;
}> = ({ onDownload, onToggleFullscreen, showFullscreen, isFullscreen }) => {
  const { t } = useTranslation();

  return (
    <ControlsOverlay>
      <Tooltip title={t("media.download")}>
        <IconButton onClick={onDownload} size="small">
          <DownloadIcon />
        </IconButton>
      </Tooltip>

      {showFullscreen && (
        <Tooltip
          title={
            isFullscreen ? t("media.exitFullscreen") : t("media.fullscreen")
          }
        >
          <IconButton onClick={onToggleFullscreen} size="small">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
      )}
    </ControlsOverlay>
  );
};

export const BusyOverlay: React.FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <LoadingOverlay>
      <CircularProgress size={60} />
    </LoadingOverlay>
  ) : null;
