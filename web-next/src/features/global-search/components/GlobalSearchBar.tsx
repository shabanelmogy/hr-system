"use client";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearchShortcut } from "../hooks/useGlobalSearchShortcut";
import type {
  GlobalSearchNavigationItem,
  GlobalSearchResultHandler,
} from "../types";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface GlobalSearchBarProps {
  navigation: readonly GlobalSearchNavigationItem[];
  placeholder?: string;
  showShortcut?: boolean;
  maxDisplayResults?: number;
  className?: string;
  onResultSelect?: GlobalSearchResultHandler;
}

export function GlobalSearchBar({
  navigation,
  placeholder,
  showShortcut = true,
  maxDisplayResults = 30,
  className,
  onResultSelect,
}: GlobalSearchBarProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  useGlobalSearchShortcut(openSearch);

  return (
    <>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        className={className}
        startIcon={<SearchRoundedIcon />}
        onClick={openSearch}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K"
        sx={{
          minHeight: 44,
          justifyContent: "flex-start",
          borderRadius: 1,
          textTransform: "none",
          px: 1.5,
        }}
      >
        <Box component="span" sx={{ flexGrow: 1, textAlign: "start" }}>
          {placeholder ?? t("globalSearch.placeholder")}
        </Box>
        {showShortcut && (
          <Box
            component="kbd"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              px: 0.75,
              py: 0.25,
              border: 1,
              borderColor: "divider",
              borderRadius: 0.75,
              color: "text.secondary",
              bgcolor: "action.hover",
              font: "inherit",
              fontSize: "0.75rem",
            }}
          >
            Ctrl K
          </Box>
        )}
      </Button>
      <GlobalSearchModal
        open={open}
        navigation={navigation}
        onClose={closeSearch}
        onResultSelect={onResultSelect}
        maxResults={maxDisplayResults}
      />
    </>
  );
}

