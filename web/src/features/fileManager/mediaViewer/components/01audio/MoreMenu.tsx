import React, { useCallback, useMemo } from "react";
import { Menu, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

export interface MoreMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  isXs: boolean;
  isSm: boolean;
  onSkip: (delta: number) => void;
  isRepeat: boolean;
  onToggleRepeat: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

type MenuEntry = { key: string; label: string; onClick: () => void };

const MoreMenu: React.FC<MoreMenuProps> = ({
  anchorEl,
  open,
  onClose,
  isXs,
  onSkip,
  isRepeat,
  onToggleRepeat,
  isMuted,
  onToggleMute,
}) => {
  const { t } = useTranslation();

  const closeAfter = useCallback((fn: () => void) => () => { fn(); onClose(); }, [onClose]);

  const xsItems = useMemo<MenuEntry[]>(() => [
    { key: "skip-30", label: t("media.prev30"), onClick: closeAfter(() => onSkip(-30)) },
    { key: "skip-10", label: t("media.prev10"), onClick: closeAfter(() => onSkip(-10)) },
    { key: "skip+10", label: t("media.next10"), onClick: closeAfter(() => onSkip(+10)) },
    { key: "skip+30", label: t("media.next30"), onClick: closeAfter(() => onSkip(+30)) },
    { key: "repeat", label: `${t("media.repeat")}: ${isRepeat ? t("media.on") : t("media.off")}`, onClick: closeAfter(onToggleRepeat) },
    { key: "mute", label: isMuted ? t("media.unmute") : t("media.mute"), onClick: closeAfter(onToggleMute) },
  ], [t, onSkip, isRepeat, onToggleRepeat, isMuted, onToggleMute, closeAfter]);

  const smMdItems = useMemo<MenuEntry[]>(() => [
    { key: "skip-30", label: t("media.prev30"), onClick: closeAfter(() => onSkip(-30)) },
    { key: "skip+30", label: t("media.next30"), onClick: closeAfter(() => onSkip(+30)) },
    { key: "repeat", label: `${t("media.repeat")}: ${isRepeat ? t("media.on") : t("media.off")}`, onClick: closeAfter(onToggleRepeat) },
    { key: "mute", label: isMuted ? t("media.unmute") : t("media.mute"), onClick: closeAfter(onToggleMute) },
  ], [t, onSkip, isRepeat, onToggleRepeat, isMuted, onToggleMute, closeAfter]);

  const items = isXs ? xsItems : smMdItems;

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {items.map((item) => (
        <MenuItem key={item.key} onClick={item.onClick}>{item.label}</MenuItem>
      ))}
    </Menu>
  );
};

export default MoreMenu;
