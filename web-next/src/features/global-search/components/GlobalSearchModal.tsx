"use client";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { normalizeAppPath } from "@/config/routes";
import type {
  GlobalSearchNavigationItem,
  GlobalSearchResult,
  GlobalSearchResultHandler,
} from "../types";
import { GlobalSearchPanel } from "./GlobalSearchPanel";

interface GlobalSearchModalProps {
  open: boolean;
  navigation: readonly GlobalSearchNavigationItem[];
  onClose: () => void;
  onResultSelect?: GlobalSearchResultHandler;
  maxResults?: number;
}

export function GlobalSearchModal({
  open,
  navigation,
  onClose,
  onResultSelect,
  maxResults = 30,
}: GlobalSearchModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleSelect = useCallback(
    (result: GlobalSearchResult) => {
      if (onResultSelect) {
        onResultSelect(result, result.path);
      } else {
        router.push(normalizeAppPath(result.path));
      }
      onClose();
    },
    [onClose, onResultSelect, router],
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      keepMounted
      aria-labelledby="global-search-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle id="global-search-dialog-title" sx={{ px: 2, py: 1.5 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <SearchRoundedIcon color="primary" />
          <Typography component="span" variant="h6" sx={{ flexGrow: 1 }}>
            {t("globalSearch.title")}
          </Typography>
          <Tooltip title={t("globalSearch.close")}>
            <IconButton onClick={onClose} aria-label={t("globalSearch.close")}>
              <CloseRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <GlobalSearchPanel
          navigation={navigation}
          autoFocus
          minSearchLength={2}
          maxResults={maxResults}
          debounceMs={250}
          onSelect={handleSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
