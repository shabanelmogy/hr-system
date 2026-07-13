import React, { useMemo, useState } from "react";
import {
  Box,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  VolumeOff as VolumeOffIcon,
  VolumeUp as VolumeUpIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Repeat as RepeatIcon,
  RepeatOne as RepeatOneIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface ControlsBarProps {
  TimeDisplay: React.ComponentType<any>;
  t: (key: string, opts?: any) => string;
  formatTime: (s: number) => string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (delta: number) => void;
  repeatMode: "off" | "all" | "one";
  onToggleRepeat: () => void;
  playbackRate: number;
  onChangePlaybackRate: () => void;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (_: Event, newValue: number | number[]) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const baseIconSx = {
  color: "#fff",
  width: 28,
  height: 28,
  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
} as const;
const skipIconSx = {
  color: "#fff",
  width: 32,
  height: 32,
  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
} as const;

function SkipButton({
  title,
  delta,
  onSeek,
  label,
  variant,
  isRtl,
}: {
  title: string;
  delta: number;
  onSeek: (d: number) => void;
  label?: string;
  variant: "prev" | "next";
  isRtl: boolean;
}) {
  const Icon = useMemo(() => {
    if (label) return null; // label overrides icon
    if (variant === "prev") return isRtl ? SkipNextIcon : SkipPreviousIcon;
    return isRtl ? SkipPreviousIcon : SkipNextIcon;
  }, [label, variant, isRtl]);

  return (
    <Tooltip title={title}>
      <IconButton onClick={() => onSeek(delta)} sx={skipIconSx}>
        {label ? (
          <Typography sx={{ fontSize: "0.6rem", fontWeight: 600 }}>
            {label}
          </Typography>
        ) : (
          Icon && <Icon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

function RepeatButton({
  repeatMode,
  onToggleRepeat,
  titleOff,
  titleAll,
  titleOne,
}: {
  repeatMode: "off" | "all" | "one";
  onToggleRepeat: () => void;
  titleOff: string;
  titleAll: string;
  titleOne: string;
}) {
  const title =
    repeatMode === "off"
      ? titleOff
      : repeatMode === "all"
      ? titleAll
      : titleOne;
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={onToggleRepeat}
        sx={{ ...baseIconSx, color: repeatMode !== "off" ? "#1976d2" : "#fff" }}
      >
        {repeatMode === "one" ? (
          <RepeatOneIcon fontSize="small" />
        ) : (
          <RepeatIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

function SpeedButton({
  playbackRate,
  onChangePlaybackRate,
  title,
}: {
  playbackRate: number;
  onChangePlaybackRate: () => void;
  title: string;
}) {
  return (
    <Tooltip title={`${title}: ${playbackRate}x`}>
      <IconButton onClick={onChangePlaybackRate} sx={baseIconSx}>
        <Typography sx={{ fontSize: "0.6rem", fontWeight: 600 }}>
          {playbackRate}x
        </Typography>
      </IconButton>
    </Tooltip>
  );
}

function VolumeControl({
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  showSlider,
  muteTitle,
  unmuteTitle,
}: {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (_: Event, v: number | number[]) => void;
  showSlider: boolean;
  muteTitle: string;
  unmuteTitle: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: showSlider ? 70 : 50,
      }}
    >
      <Tooltip title={isMuted ? unmuteTitle : muteTitle}>
        <IconButton onClick={onToggleMute} sx={baseIconSx}>
          {isMuted ? (
            <VolumeOffIcon fontSize="small" />
          ) : (
            <VolumeUpIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
      {showSlider && (
        <Slider
          value={isMuted ? 0 : volume}
          onChange={onVolumeChange}
          min={0}
          max={1}
          step={0.05}
          sx={{
            width: 50,
            color: "#fff",
            "& .MuiSlider-thumb": { width: 8, height: 8 },
          }}
        />
      )}
    </Box>
  );
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  TimeDisplay,
  formatTime,
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSeek,
  repeatMode,
  onToggleRepeat,
  playbackRate,
  onChangePlaybackRate,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.down("md"));
  const isMd = useMediaQuery(theme.breakpoints.down("lg"));
  const isRtl = theme.direction === "rtl";
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const { t } = useTranslation();

  const repeatTitles = useMemo(
    () => ({
      off: t("media.repeatOff"),
      all: t("media.repeatAll"),
      one: t("media.repeatOne"),
    }),
    [t]
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
      }}
    >
      {/* Left: Time Display */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
        <Typography
          sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}
        >
          /
        </Typography>
        <TimeDisplay>{formatTime(duration)}</TimeDisplay>
      </Box>

      {/* Center: Play Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!isMd && (
          <>
            <SkipButton
              title={t("media.prev30")}
              delta={-30}
              onSeek={onSeek}
              variant="prev"
              isRtl={isRtl}
            />
            <SkipButton
              title={t("media.prev10")}
              delta={-10}
              onSeek={onSeek}
              label="-10"
              variant="prev"
              isRtl={isRtl}
            />
          </>
        )}

        {!isXs && (
          <SkipButton
            title={t("media.prev10")}
            delta={-10}
            onSeek={onSeek}
            label="-10"
            variant="prev"
            isRtl={isRtl}
          />
        )}

        {/* Play/Pause */}
        <Tooltip title={isPlaying ? t("media.pause") : t("media.play")}>
          <IconButton
            onClick={onPlayPause}
            sx={{
              color: "#fff",
              width: 48,
              height: 48,
              backgroundColor: "rgba(255,255,255,0.15)",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.25)" },
            }}
          >
            {isPlaying ? (
              <PauseIcon sx={{ fontSize: 24 }} />
            ) : (
              <PlayIcon sx={{ fontSize: 24 }} />
            )}
          </IconButton>
        </Tooltip>

        {!isXs && (
          <SkipButton
            title={t("media.next10")}
            delta={10}
            onSeek={onSeek}
            label="+10"
            variant="next"
            isRtl={isRtl}
          />
        )}

        {!isMd && (
          <>
            <SkipButton
              title={t("media.next10")}
              delta={10}
              onSeek={onSeek}
              label="+10"
              variant="next"
              isRtl={isRtl}
            />
            <SkipButton
              title={t("media.next30")}
              delta={30}
              onSeek={onSeek}
              variant="next"
              isRtl={isRtl}
            />
          </>
        )}
      </Box>

      {/* Right: Additional Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {!isMd && (
          <>
            <RepeatButton
              repeatMode={repeatMode}
              onToggleRepeat={onToggleRepeat}
              titleOff={repeatTitles.off}
              titleAll={repeatTitles.all}
              titleOne={repeatTitles.one}
            />
            <SpeedButton
              playbackRate={playbackRate}
              onChangePlaybackRate={onChangePlaybackRate}
              title={t("media.speed")}
            />
          </>
        )}

        {!isXs && (
          <VolumeControl
            isMuted={isMuted}
            volume={volume}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
            showSlider={!isSm}
            muteTitle={t("media.mute")}
            unmuteTitle={t("media.unmute")}
          />
        )}

        <Tooltip
          title={
            isFullscreen ? t("media.exitFullscreen") : t("media.fullscreen")
          }
        >
          <IconButton onClick={onToggleFullscreen} sx={baseIconSx}>
            {isFullscreen ? (
              <FullscreenExitIcon fontSize="small" />
            ) : (
              <FullscreenIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {(isMd || isSm || isXs) && (
          <Tooltip title={t("files.more")}>
            <IconButton
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              sx={baseIconSx}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { bgcolor: "rgba(0,0,0,0.8)", color: "#fff" } }}
      >
        {isXs && (
          <>
            <MenuItem
              onClick={() => {
                onSeek(-30);
                setMenuAnchor(null);
              }}
            >
              <SkipPreviousIcon sx={{ mr: 1 }} />
              {t("media.prev30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSeek(-10);
                setMenuAnchor(null);
              }}
            >
              <Typography sx={{ mr: 1, fontSize: "0.8rem" }}>-10</Typography>
              {t("media.prev10")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSeek(10);
                setMenuAnchor(null);
              }}
            >
              <Typography sx={{ mr: 1, fontSize: "0.8rem" }}>+10</Typography>
              {t("media.next10")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSeek(30);
                setMenuAnchor(null);
              }}
            >
              <SkipNextIcon sx={{ mr: 1 }} />
              {t("media.next30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleRepeat();
                setMenuAnchor(null);
              }}
            >
              {repeatMode === "one" ? (
                <RepeatOneIcon sx={{ mr: 1 }} />
              ) : (
                <RepeatIcon sx={{ mr: 1 }} />
              )}
              {repeatMode === "off"
                ? t("media.repeatOff")
                : repeatMode === "all"
                ? t("media.repeatAll")
                : t("media.repeatOne")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onChangePlaybackRate();
                setMenuAnchor(null);
              }}
            >
              <Typography sx={{ mr: 1, fontSize: "0.8rem" }}>
                {playbackRate}x
              </Typography>
              {t("media.speed")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleMute();
                setMenuAnchor(null);
              }}
            >
              {isMuted ? (
                <VolumeOffIcon sx={{ mr: 1 }} />
              ) : (
                <VolumeUpIcon sx={{ mr: 1 }} />
              )}
              {isMuted ? t("media.unmute") : t("media.mute")}
            </MenuItem>
          </>
        )}

        {isSm && !isXs && (
          <>
            <MenuItem
              onClick={() => {
                onSeek(-30);
                setMenuAnchor(null);
              }}
            >
              <SkipPreviousIcon sx={{ mr: 1 }} />
              {t("media.prev30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSeek(30);
                setMenuAnchor(null);
              }}
            >
              <SkipNextIcon sx={{ mr: 1 }} />
              {t("media.next30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleRepeat();
                setMenuAnchor(null);
              }}
            >
              {repeatMode === "one" ? (
                <RepeatOneIcon sx={{ mr: 1 }} />
              ) : (
                <RepeatIcon sx={{ mr: 1 }} />
              )}
              {repeatMode === "off"
                ? t("media.repeatOff")
                : repeatMode === "all"
                ? t("media.repeatAll")
                : t("media.repeatOne")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onChangePlaybackRate();
                setMenuAnchor(null);
              }}
            >
              <Typography sx={{ mr: 1, fontSize: "0.8rem" }}>
                {playbackRate}x
              </Typography>
              {t("media.speed")}
            </MenuItem>
          </>
        )}

        {isMd && !isSm && (
          <>
            <MenuItem
              onClick={() => {
                onSeek(-30);
                setMenuAnchor(null);
              }}
            >
              <SkipPreviousIcon sx={{ mr: 1 }} />
              {t("media.prev30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onSeek(30);
                setMenuAnchor(null);
              }}
            >
              <SkipNextIcon sx={{ mr: 1 }} />
              {t("media.next30")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onToggleRepeat();
                setMenuAnchor(null);
              }}
            >
              {repeatMode === "one" ? (
                <RepeatOneIcon sx={{ mr: 1 }} />
              ) : (
                <RepeatIcon sx={{ mr: 1 }} />
              )}
              {repeatMode === "off"
                ? t("media.repeatOff")
                : repeatMode === "all"
                ? t("media.repeatAll")
                : t("media.repeatOne")}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onChangePlaybackRate();
                setMenuAnchor(null);
              }}
            >
              <Typography sx={{ mr: 1, fontSize: "0.8rem" }}>
                {playbackRate}x
              </Typography>
              {t("media.speed")}
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};
