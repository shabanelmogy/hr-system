"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  GlobalSearchHistoryItem,
  GlobalSearchOptions,
  GlobalSearchResult,
} from "../types";
import { filterSearchCatalog, normalizeSearchText } from "../utils/searchCatalog";

const defaultOptions = {
  minSearchLength: 2,
  maxResults: 20,
  debounceMs: 250,
} as const;

export const useGlobalSearch = (
  catalog: readonly GlobalSearchResult[],
  options: GlobalSearchOptions = {},
) => {
  const minSearchLength = options.minSearchLength ?? defaultOptions.minSearchLength;
  const maxResults = options.maxResults ?? defaultOptions.maxResults;
  const debounceMs = options.debounceMs ?? defaultOptions.debounceMs;
  const [searchTerm, setSearchTerm] = useState("");
  const [settledTerm, setSettledTerm] = useState("");
  const [history, setHistory] = useState<GlobalSearchHistoryItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPendingSearch = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingSearch, [cancelPendingSearch]);

  const search = useCallback(
    (term: string) => {
      cancelPendingSearch();
      setSearchTerm(term);

      if (normalizeSearchText(term).length < minSearchLength) {
        setSettledTerm(term);
        return;
      }

      timerRef.current = setTimeout(() => {
        setSettledTerm(term);
        timerRef.current = null;
      }, Math.max(0, debounceMs));
    },
    [cancelPendingSearch, debounceMs, minSearchLength],
  );

  const clearSearch = useCallback(() => {
    cancelPendingSearch();
    setSearchTerm("");
    setSettledTerm("");
  }, [cancelPendingSearch]);

  const results = useMemo(
    () =>
      filterSearchCatalog(
        catalog,
        settledTerm,
        minSearchLength,
        maxResults,
      ),
    [catalog, maxResults, minSearchLength, settledTerm],
  );

  const recordSelection = useCallback(
    (result: GlobalSearchResult) => {
      const term = searchTerm.trim();
      if (!term) return;

      const item: GlobalSearchHistoryItem = {
        ...result,
        term,
        timestamp: Date.now(),
      };

      setHistory((current) => [
        item,
        ...current.filter(
          (existing) =>
            existing.path !== item.path || existing.term !== item.term,
        ),
      ].slice(0, 8));
    },
    [searchTerm],
  );

  const accessiblePaths = useMemo(
    () => new Set(catalog.map(({ path }) => path)),
    [catalog],
  );
  const searchHistory = useMemo(
    () => history.filter(({ path }) => accessiblePaths.has(path)),
    [accessiblePaths, history],
  );

  const removeFromHistory = useCallback((path: string, term: string) => {
    setHistory((current) =>
      current.filter(
        (item) => item.path !== path || item.term !== term,
      ),
    );
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const normalizedSettledTerm = normalizeSearchText(settledTerm);

  return {
    searchTerm,
    search,
    clearSearch,
    results,
    isSearching:
      normalizedSearchTerm.length >= minSearchLength &&
      normalizedSearchTerm !== normalizedSettledTerm,
    hasSearched: normalizedSettledTerm.length >= minSearchLength,
    minSearchLength,
    searchHistory,
    recordSelection,
    removeFromHistory,
    clearHistory,
  };
};

