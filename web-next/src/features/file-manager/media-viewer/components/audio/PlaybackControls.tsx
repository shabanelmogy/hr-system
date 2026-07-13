import React from "react";
import { IconButton } from "@mui/material";
import { PlayArrow as PlayIcon, Pause as PauseIcon } from "@mui/icons-material";

export interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onSkipForward: () => void;
  pulseAnim?: string;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  onPlayPause,
  pulseAnim,
}) => {
  return (
    <IconButton
      onClick={onPlayPause}
      size="large"
      color="primary"
      sx={{
        animation: pulseAnim || "none",
        transition: "all 0.3s ease",
        width: { xs: 48, sm: 56 },
        height: { xs: 48, sm: 56 },
        "&:hover": {
          transform: "scale(1.1)",
          boxShadow: "0 0 20px rgba(25, 118, 210, 0.5)",
        },
      }}
    >
      {isPlaying ? (
        <PauseIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
      ) : (
        <PlayIcon sx={{ fontSize: { xs: 24, sm: 32 } }} />
      )}
    </IconButton>
  );
};

export default PlaybackControls;
