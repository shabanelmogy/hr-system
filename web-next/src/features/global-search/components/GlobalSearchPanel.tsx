"use client";

import SearchOffRoundedIcon from "@mui/icons-material/SearchOffRounded";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import {
  useCallback,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useGlobalSearch } from "../hooks/useGlobalSearch";
import type {
  GlobalSearchNavigationItem,
  GlobalSearchOptions,
  GlobalSearchResult,
} from "../types";
import { buildSearchCatalog } from "../utils/searchCatalog";
import { SearchField } from "./SearchField";
import { SearchHistory } from "./SearchHistory";
import { SearchResultList } from "./SearchResultList";

interface GlobalSearchPanelProps extends GlobalSearchOptions {
  navigation: readonly GlobalSearchNavigationItem[];
  autoFocus?: boolean;
  onSelect: (result: GlobalSearchResult) => void;
}

export function GlobalSearchPanel({
  navigation,
  autoFocus = false,
  minSearchLength,
  maxResults,
  debounceMs,
  onSelect,
}: GlobalSearchPanelProps) {
  const { t } = useTranslation();
  const listboxId = `global-search-${useId().replace(/:/g, "")}`;
  const translate = useCallback((key: string) => t(key), [t]);
  const catalog = useMemo(
    () => buildSearchCatalog(navigation, translate),
    [navigation, translate],
  );
  const {
    searchTerm,
    search,
    clearSearch,
    results,
    isSearching,
    hasSearched,
    minSearchLength: effectiveMinLength,
    searchHistory,
    recordSelection,
    removeFromHistory,
    clearHistory,
  } = useGlobalSearch(catalog, {
    minSearchLength,
    maxResults,
    debounceMs,
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const result of results) {
      const current = counts.get(result.categoryKey);
      counts.set(result.categoryKey, {
        label: result.category,
        count: (current?.count ?? 0) + 1,
      });
    }
    return [...counts.entries()];
  }, [results]);

  const categoryExists = categories.some(([key]) => key === selectedCategory);
  const activeCategory =
    selectedCategory === "all" || categoryExists ? selectedCategory : "all";
  const visibleResults = useMemo(
    () =>
      activeCategory === "all"
        ? results
        : results.filter(({ categoryKey }) => categoryKey === activeCategory),
    [activeCategory, results],
  );
  const activeIndex =
    selectedIndex >= 0 && selectedIndex < visibleResults.length
      ? selectedIndex
      : -1;

  const handleSearchChange = (value: string) => {
    setSelectedIndex(-1);
    setSelectedCategory("all");
    search(value);
  };

  const handleClear = () => {
    setSelectedIndex(-1);
    setSelectedCategory("all");
    clearSearch();
  };

  const handleSelect = (result: GlobalSearchResult) => {
    recordSelection(result);
    onSelect(result);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (visibleResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current < visibleResults.length - 1 ? current + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) =>
        current > 0 ? current - 1 : visibleResults.length - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(visibleResults[activeIndex]);
    }
  };

  const belowMinimum =
    searchTerm.trim().length > 0 &&
    searchTerm.trim().length < effectiveMinLength;
  const resultStatus = t("globalSearch.resultCount", {
    count: visibleResults.length,
  });

  return (
    <Box>
      <Box sx={{ p: 2 }}>
        <SearchField
          value={searchTerm}
          placeholder={t("globalSearch.placeholder")}
          clearLabel={t("globalSearch.clear")}
          isSearching={isSearching}
          listboxId={listboxId}
          activeOptionId={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          autoFocus={autoFocus}
          onChange={handleSearchChange}
          onClear={handleClear}
          onKeyDown={handleKeyDown}
        />
      </Box>

      {results.length > 0 && categories.length > 1 && (
        <Tabs
          value={activeCategory}
          onChange={(_, value: string) => {
            setSelectedCategory(value);
            setSelectedIndex(-1);
          }}
          variant="scrollable"
          scrollButtons="auto"
          aria-label={t("globalSearch.filterLabel")}
          sx={{ px: 1, minHeight: 42, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            value="all"
            label={`${t("globalSearch.all")} (${results.length})`}
            sx={{ minHeight: 42 }}
          />
          {categories.map(([key, category]) => (
            <Tab
              key={key}
              value={key}
              label={`${category.label} (${category.count})`}
              sx={{ minHeight: 42 }}
            />
          ))}
        </Tabs>
      )}

      <Box sx={{ maxHeight: { xs: "60vh", sm: 420 }, overflowY: "auto" }}>
        {!searchTerm && (
          <SearchHistory
            items={searchHistory}
            title={t("globalSearch.recent")}
            clearLabel={t("globalSearch.clearRecent")}
            removeLabel={(title) =>
              t("globalSearch.removeRecent", { title })
            }
            onSelect={(item) => handleSearchChange(item.term)}
            onRemove={(item) => removeFromHistory(item.path, item.term)}
            onClear={clearHistory}
          />
        )}

        {visibleResults.length > 0 && (
          <SearchResultList
            results={visibleResults}
            selectedIndex={activeIndex}
            listboxId={listboxId}
            resultLabel={t("globalSearch.results")}
            onSelect={handleSelect}
            onHighlight={setSelectedIndex}
          />
        )}

        {belowMinimum && (
          <Typography color="text.secondary" variant="body2" sx={{ px: 2, pb: 2 }}>
            {t("globalSearch.minimumCharacters", {
              count: effectiveMinLength,
            })}
          </Typography>
        )}

        {hasSearched && !isSearching && visibleResults.length === 0 && (
          <Box sx={{ py: 6, px: 2, textAlign: "center", color: "text.secondary" }}>
            <SearchOffRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="subtitle1">{t("globalSearch.noResults")}</Typography>
          </Box>
        )}
      </Box>

      <Box
        component="span"
        aria-live="polite"
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
        }}
      >
        {hasSearched ? resultStatus : ""}
      </Box>
    </Box>
  );
}
