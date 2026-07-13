import React, { useState } from "react";
import { Card, Box, useMediaQuery, useTheme, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import ProgressBar from "../01audio/ProgressBar";
import PlaybackControls from "../01audio/PlaybackControls";
import VolumeControl from "../01audio/VolumeControl";
import Visualizer from "../01audio/Visualizer";
import { useAudioPlayer } from "../01audio/useAudioPlayer";
import { pulse, rotate, wave, glow } from "../01audio/styles";
import TimeDisplay from "../01audio/TimeDisplay";
import RepeatToggle from "../01audio/RepeatToggle";
import { formatTime } from "../10utils/time";
import SkipButton from "../01audio/SkipButton";
import MoreMenu from "../01audio/MoreMenu";
import HeaderBar from "../01audio/HeaderBar";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";

interface AudioPlayerProps {
  mediaUrl: string;
  onError: (message: string) => void;
  onBack?: () => void;
  isMinimal?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ mediaUrl, onError, onBack }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.down('md'));
  const isMd = useMediaQuery(theme.breakpoints.down('lg'));
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  
  const setPosition = (url: string, time: number) => {
    localStorage.setItem(`audio-${url}`, time.toString());
  };
  
  const {
    audioRef,
    isPlaying,
    togglePlayPause,
    skip,
    currentTime,
    duration,
    onProgressChange: handleProgressChange,
    volume,
    isMuted,
    onVolumeChange: handleVolumeChange,
    toggleMute: handleMuteToggle,
    isRepeat,
    toggleRepeat: toggleRepeatMode,
    audioData,
  } = useAudioPlayer({ mediaUrl, onError });

  const handlePlayPause = togglePlayPause;

  const handleSkip = skip;

  const handleBack = () => {
    if (audioRef.current?.currentTime) {
      setPosition(mediaUrl, audioRef.current.currentTime);
    }
    onBack?.();
  };

  return (
    <Card sx={{ 
      width: isXs ? "100vw" : isSm ? "calc(100vw - 100px)" : isMd ? "calc(100vw - 200px)" : "calc(100vw - 500px)", 
      height: isXs ? "100vh" : "calc(100vh - 100px)", 
      display: "flex", 
      flexDirection: "column",
      margin: isXs ? 0 : "auto"
    }}>
      <HeaderBar onBack={onBack ? handleBack : undefined} />

      <Visualizer
        isPlaying={isPlaying}
        audioData={audioData}
        rotateAnim={`${rotate} 3s linear infinite`}
        waveAnim={(i) => `${wave} ${0.5 + (i % 3) * 0.2}s infinite ${i * 0.1}s`}
      />

      {/* Controls */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <ProgressBar value={currentTime} onChange={handleProgressChange} max={duration || 100} playingGlow={isPlaying ? `${glow} 2s infinite` : 'none'} />
        
        {/* Single Row Controls Layout */}
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          gap: { xs: 0.5, sm: 1.5 },
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          minHeight: { xs: 44, sm: 56 }
        }}>
          {/* Left: Time Display */}
          <TimeDisplay currentTime={currentTime} duration={duration} formatTime={formatTime} />

          {/* Center: Play Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
            {!isMd && (
              <SkipButton title="Skip -30s" delta={-30} onSkip={handleSkip} />
            )}
            {!isSm && (
              <SkipButton title="Skip -10s" delta={-10} onSkip={handleSkip} />
            )}

            {/* Always show play/pause */}
            <PlaybackControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSkipBack={() => handleSkip(-10)}
              onPrev={undefined}
              onNext={undefined}
              onSkipForward={() => handleSkip(10)}
              pulseAnim={isPlaying ? `${pulse} 2s infinite` : 'none'}
            />

            {!isSm && (
              <SkipButton title="Skip +10s" delta={10} onSkip={handleSkip} />
            )}
            {!isMd && (
              <SkipButton title="Skip +30s" delta={30} onSkip={handleSkip} />
            )}
          </Box>

          {/* Right: Additional Controls */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
            {/* Always show repeat and volume on MD+ screens */}
            <RepeatToggle isRepeat={isRepeat} onToggle={toggleRepeatMode} rotateAnim={`${rotate} 2s linear infinite`} />
            
            <VolumeControl
              volume={volume}
              isMuted={isMuted}
              onChange={handleVolumeChange}
              onToggleMute={handleMuteToggle}
              pulseAnim={!isMuted && isPlaying ? `${pulse} 3s infinite` : 'none'}
            />
            
            {/* Show menu up to md screens */}
            {(isMd || isSm || isXs) && (
              <Tooltip title="More">
                <IconButton 
                  onClick={(e) => setMenuAnchor(e.currentTarget)} 
                  size="small"
                  sx={{ width: { xs: 28, sm: 36 }, height: { xs: 28, sm: 36 } }}
                >
                  <MoreVertIcon sx={{ fontSize: { xs: 16, sm: 22 } }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      <MoreMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        isXs={isXs}
        isSm={isSm}
        onSkip={handleSkip}
        isRepeat={isRepeat}
        onToggleRepeat={toggleRepeatMode}
        isMuted={isMuted}
        onToggleMute={handleMuteToggle}
      />

      <audio ref={audioRef} src={mediaUrl}>
        {t("media.audioNotSupported")}
      </audio>
    </Card>
  );
};

export default AudioPlayer;