"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { IconButton, Tooltip } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearchShortcut } from "../hooks/useGlobalSearchShortcut";
import type {
  GlobalSearchNavigationItem,
  GlobalSearchResultHandler,
} from "../types";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface GlobalSearchButtonProps {
  navigation: readonly GlobalSearchNavigationItem[];
  onResultSelect?: GlobalSearchResultHandler;
}

export function GlobalSearchButton({
  navigation,
  onResultSelect,
}: GlobalSearchButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useGlobalSearchShortcut(openSearch);

  return (
    <>
      <Tooltip title={t("globalSearch.open")}>
        <IconButton
          color="inherit"
          onClick={openSearch}
          aria-label={t("globalSearch.open")}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
        >
          <SearchRoundedIcon />
        </IconButton>
      </Tooltip>
      <GlobalSearchModal
        open={open}
        navigation={navigation}
        onClose={closeSearch}
        onResultSelect={onResultSelect}
      />
    </>
  );
}

