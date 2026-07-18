import type { ReactNode } from "react";
import {
  Clear as ClearIcon,
  FilterAltOffOutlined as ClearFiltersIcon,
  Refresh as RefreshIcon,
  SearchOffOutlined as NoResultsIcon,
} from "@mui/icons-material";
import { Button } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FeedbackState } from "./FeedbackState";

export interface NoResultsStateProps {
  searchTerm?: string;
  message?: ReactNode;
  subtitle?: ReactNode;
  onClearSearch?: () => void;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  sx?: SxProps<Theme>;
}

export function NoResultsState({
  searchTerm,
  message,
  subtitle,
  onClearSearch,
  onClearFilters,
  onRefresh,
  sx,
}: NoResultsStateProps) {
  const { t } = useTranslation();
  const title =
    message ??
    (searchTerm
      ? t("feedback.noResults.messageWithTerm", { term: searchTerm })
      : t("feedback.noResults.message"));
  const hasActions = Boolean(
    (searchTerm && onClearSearch) || onClearFilters || onRefresh,
  );

  const actions = (
    <>
      {searchTerm && onClearSearch && (
        <Button variant="outlined" onClick={onClearSearch} startIcon={<ClearIcon />}>
          {t("feedback.noResults.clearSearch")}
        </Button>
      )}
      {onClearFilters && (
        <Button
          variant="outlined"
          onClick={onClearFilters}
          startIcon={<ClearFiltersIcon />}
        >
          {t("feedback.noResults.clearFilters")}
        </Button>
      )}
      {onRefresh && (
        <Button variant="text" onClick={onRefresh} startIcon={<RefreshIcon />}>
          {t("feedback.noResults.refresh")}
        </Button>
      )}
    </>
  );

  return (
    <FeedbackState
      icon={<NoResultsIcon />}
      title={title}
      description={subtitle}
      actions={hasActions ? actions : undefined}
      sx={sx}
    />
  );
}

export default NoResultsState;
