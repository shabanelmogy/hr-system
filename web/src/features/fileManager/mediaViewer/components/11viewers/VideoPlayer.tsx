import React from "react";
import {
  Box,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  PlayArrow as PlayIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import TimeMarks from '../07controls/TimeMarks';
import VideoSidebar from '../08layout/VideoSidebar';
import { TopBar } from '../02video/TopBar';
import { ProgressBar } from '../02video/ProgressBar';
import { ControlsBar } from '../02video/ControlsBar';
import { formatTime } from '../02video/utils';
import { useVideoPlayer } from '../02video/useVideoPlayer';
import { ControlsOverlay, TimeDisplay, VideoContainer, VideoElement } from "../02video/styles";

interface VideoPlayerProps {
  mediaUrl: string;
  onError: (message: string) => void;
  onBack?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ mediaUrl, onError, onBack }) => {
  const { t } = useTranslation();
  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isLoading,
    showControls,
    setShowControls,
    playbackRate,
    repeatMode,
    showTimeMarks,
    setShowTimeMarks,
    showSidebar,
    setShowSidebar,
    handlePlayPause,
    handleProgressChange,
    handleVolumeChange,
    handleMuteToggle,
    handleFullscreen,
    handleDownload,
    handlePlaybackRateChange,
    handlePictureInPicture,
    handleRepeatToggle,
    handleMouseMove,
    seekBy,
  } = useVideoPlayer({ mediaUrl, onError, t });

  return (
    <VideoContainer
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      sx={{
        maxHeight: isFullscreen ? "100vh" : "80vh",
        marginRight: showSidebar ? "350px" : 0,
        transition: "margin-right 0.3s ease",
      }}
    >
      <VideoElement
        ref={videoRef}
        src={mediaUrl}
        {...({ controlsList: "nodownload" } as any)}
        preload="metadata"
        onClick={handlePlayPause}
        onLoadStart={() => console.log("Video load started")}
        onLoadedMetadata={() => {
          console.log("Video metadata loaded");
          onError("");
        }}
        onCanPlay={() => console.log("Video can play")}
      >
        {t("media.videoNotSupported")}
      </VideoElement>

      {/* Center Play Button Overlay */}
      {!isPlaying && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            opacity: showControls ? 1 : 0.7,
            transition: "opacity 0.3s ease",
          }}
        >
          <IconButton
            onClick={handlePlayPause}
            sx={{
              width: 80,
              height: 80,
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "#fff",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.8)",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
            }}
          >
            <PlayIcon sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      )}

      {/* Loading Progress */}
      {isLoading && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}

      <TopBar
        title={t("media.videoPlayer")}
        show={showControls}
        onDownload={handleDownload}
        onPip={handlePictureInPicture}
        sidebarActive={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onBack={onBack}
      />

      {/* Bottom Controls */}
      <ControlsOverlay
        className="controls-overlay"
        sx={{
          opacity: showControls ? 1 : 0,
        }}
      >
        <ProgressBar value={currentTime} max={duration || 100} disabled={isLoading} onChange={handleProgressChange} />
        <ControlsBar
          TimeDisplay={TimeDisplay}
          t={t}
          formatTime={formatTime}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onSeek={seekBy}
          repeatMode={repeatMode}
          onToggleRepeat={handleRepeatToggle}
          playbackRate={playbackRate}
          onChangePlaybackRate={handlePlaybackRateChange}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={handleMuteToggle}
          onVolumeChange={handleVolumeChange}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleFullscreen}
        />
      </ControlsOverlay>
      
      <TimeMarks
        currentTime={currentTime}
        onSeek={(time) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        }}
        isOpen={showTimeMarks}
        onClose={() => setShowTimeMarks(false)}
      />
      
      <VideoSidebar
        open={showSidebar}
        onClose={() => setShowSidebar(false)}
        currentTime={currentTime}
        onSeek={(time) => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
          }
        }}
      />
    </VideoContainer>
  );
};

export default VideoPlayer;
