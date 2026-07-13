import { useEffect, useRef, useState } from "react";

export interface UseAudioPlayerArgs {
  mediaUrl: string;
  onError: (message: string) => void;
}

export function useAudioPlayer({ mediaUrl, onError }: UseAudioPlayerArgs) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(Array(32).fill(0));

  // Utils
  const setPosition = (url: string, time: number) => {
    localStorage.setItem(`audio-${url}`, time.toString());
  };
  const getPosition = (url: string): number => {
    const stored = localStorage.getItem(`audio-${url}`);
    const parsed = stored != null ? Number(stored) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Visualization animation loop (simulated data)
  useEffect(() => {
    let animationId: number;
    const updateAudioData = () => {
      if (isPlaying) {
        setAudioData((prev) =>
          prev.map(
            (_, i) =>
              Math.random() * 0.7 + 0.3 + Math.sin(Date.now() / 200 + i) * 0.2
          )
        );
      }
      animationId = requestAnimationFrame(updateAudioData);
    };

    if (isPlaying) {
      updateAudioData();
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  // Media event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return null;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      const savedPosition = getPosition(mediaUrl);
      if (savedPosition > 0) {
        audio.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
    };
    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      setPosition(mediaUrl, time);
    };
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        void audio.play();
      } else {
        setIsPlaying(false);
      }
    };
    const handleError = () => onError("Failed to load audio");

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      if (audio.currentTime > 0) setPosition(mediaUrl, audio.currentTime);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [mediaUrl, onError, isRepeat]);

  // Handlers
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  const onProgressChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const onVolumeChange = (_: Event, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(value);
    const audio = audioRef.current;
    if (audio) audio.volume = value;
    if (value > 0 && isMuted) setIsMuted(false);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = nextTime;
  };

  const toggleRepeat = () => setIsRepeat((p) => !p);

  return {
    audioRef,
    // playback
    isPlaying,
    togglePlayPause,
    skip,
    // time
    currentTime,
    duration,
    onProgressChange,
    // volume
    volume,
    isMuted,
    onVolumeChange,
    toggleMute,
    // repeat
    isRepeat,
    toggleRepeat,
    // PiP (UI flag)
    isPictureInPicture,
    setIsPictureInPicture,
    // visualization data
    audioData,
  } as const;
}
