import type { ReactNode } from "react";

export interface GlobalSearchNavigationItem {
  title: string;
  icon?: ReactNode;
  path?: string;
  items?: readonly GlobalSearchNavigationItem[];
}

export interface GlobalSearchResult {
  id: string;
  title: string;
  categoryKey: string;
  category: string;
  breadcrumbs: readonly string[];
  path: string;
  icon?: ReactNode;
  searchText: string;
}

export interface GlobalSearchHistoryItem extends GlobalSearchResult {
  term: string;
  timestamp: number;
}

export interface GlobalSearchOptions {
  minSearchLength?: number;
  maxResults?: number;
  debounceMs?: number;
}

export type GlobalSearchResultHandler = (
  result: GlobalSearchResult,
  route: string,
) => void;

