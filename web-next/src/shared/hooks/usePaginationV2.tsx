// usePagination.js
import { useEffect, useState, useSyncExternalStore } from "react";
import { DEFAULT_ROWS_PER_PAGE } from "@/shared/constants/pagination";

type PageStore = {
  getSnapshot: () => number;
  subscribe: (listener: () => void) => () => void;
  setPage: (nextPage: number | ((previousPage: number) => number)) => void;
};

const createPageStore = (initialPage: number): PageStore => {
  let page = initialPage;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => page,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setPage: (nextPage) => {
      const next = typeof nextPage === "function" ? nextPage(page) : nextPage;
      if (next === page) return;
      page = next;
      listeners.forEach((listener) => listener());
    },
  };
};

export const getEffectivePaginationPage = (
  rawPage: number,
  totalPages: number,
  onItemsChange: boolean,
) => {
  if (!onItemsChange || totalPages <= 0) return rawPage;
  return Math.min(Math.max(rawPage, 1), totalPages);
};

const usePaginationV2 = (
  initialPage = 1,
  initialRowsPerPage = DEFAULT_ROWS_PER_PAGE,
  totalItems: number,
  onItemsChange = false
) => {
  const [pageStore] = useState(() => createPageStore(initialPage));
  const rawPage = useSyncExternalStore(pageStore.subscribe, pageStore.getSnapshot, pageStore.getSnapshot);
  const setPage = pageStore.setPage;
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Keep the public setter/API compatible while clamping synchronously in the derived view.
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const page = getEffectivePaginationPage(rawPage, totalPages, onItemsChange);

  useEffect(() => {
    if (onItemsChange && totalItems > 0) {
      pageStore.setPage(page);
    }
  }, [onItemsChange, page, pageStore, totalItems]);

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
};

export default usePaginationV2;
