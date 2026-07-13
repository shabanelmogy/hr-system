import { useEffect, useRef, useState } from "react";

export type RepeatMode = "off" | "all" | "one";

interface UseVideoPlayerArgs {
  mediaUrl: string;
  onError: (message: string) => void;
  t: (key: string, opts?: any) => string;
}

export const useVideoPlayer = ({
  mediaUrl,
  onError,
  t,
}: UseVideoPlayerArgs) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [showTimeMarks, setShowTimeMarks] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) null;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      if (repeatMode === "one") {
        video.currentTime = 0;
        void video.play();
      } else if (repeatMode === "all") {
        video.currentTime = 0;
        void video.play();
      } else {
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      onError(t("media.failedToLoadVideo", { code: "unknown" }));
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [onError, t, repeatMode]);

  const handlePlayPause = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isPlaying) {
      v.pause();
      setIsPlaying(false);
    } else {
      void v.play();
      setIsPlaying(true);
    }
  };

  const handleProgressChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(value);
    const v = videoRef.current;
    if (v) {
      v.volume = value;
    }
    if (value > 0 && isMuted) setIsMuted(false);
  };

  const handleMuteToggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isMuted) {
      v.volume = volume;
      setIsMuted(false);
    } else {
      v.volume = 0;
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    const c = containerRef.current;
    if (!c) return;
    if (!isFullscreen) {
      if (c.requestFullscreen) c.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = mediaUrl;
    link.download = "video.mp4";
    link.click();
  };

  const handlePlaybackRateChange = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    const v = videoRef.current;
    if (v) v.playbackRate = nextRate;
  };

  const handlePictureInPicture = async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch (error) {
      // swallow
      // eslint-disable-next-line no-console
      console.error("PiP error:", error);
    }
  };

  const handleRepeatToggle = () => {
    const modes: RepeatMode[] = ["off", "all", "one"];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(
        () => setShowControls(false),
        3000
      );
    }
  };

  useEffect(
    () => () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    },
    []
  );

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    const next = Math.min(duration, Math.max(0, v.currentTime + delta));
    v.currentTime = next;
  };

  return {
    // refs
    videoRef,
    containerRef,
    // state
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
    // handlers
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
  } as const;
};
