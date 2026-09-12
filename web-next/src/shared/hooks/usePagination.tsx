import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  DEFAULT_ROWS_PER_PAGE,
  DEFAULT_ROWS_PER_PAGE_OPTIONS,
} from "@/shared/constants/pagination";

type PaginationOptions = {
  initialPage?: number;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: readonly number[];
};
type SelectLikeEvent = { target: { value: unknown } };

export const clampPaginationPage = (page: number, totalPages: number) =>
  Math.min(Math.max(page, 1), Math.max(totalPages, 1));

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

const usePagination = <T,>(items: T[] = [], options: PaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialRowsPerPage = DEFAULT_ROWS_PER_PAGE,
    rowsPerPageOptions = DEFAULT_ROWS_PER_PAGE_OPTIONS,
  } = options;

  const [pageStore] = useState(() => createPageStore(initialPage));
  const rawPage = useSyncExternalStore(pageStore.subscribe, pageStore.getSnapshot, pageStore.getSnapshot);
  const setPage = pageStore.setPage;
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Derived values
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const page = clampPaginationPage(rawPage, totalPages);

  useEffect(() => {
    pageStore.setPage(page);
  }, [page, pageStore]);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  // Get current page items
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Handler for rows per page change
  const handleRowsPerPageChange = (event: SelectLikeEvent) => {
    const newRowsPerPage = Number.parseInt(String(event.target.value), 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  // Handler for page change
  const handlePageChange = (_event: SelectLikeEvent, newPage: number) => {
    setPage(newPage);
  };

  // Navigate to specific item by index or id
  const navigateToItem = (identifier: unknown, isId = false) => {
    let itemIndex: number;

    if (isId) {
      // Find item by ID and get its index
      itemIndex = items.findIndex((item) => {
        if (typeof item !== "object" || item === null || !("id" in item)) return false;
        return item.id === identifier;
      });
      if (itemIndex === -1) return false;
    } else {
      // Direct index
      itemIndex = typeof identifier === "number" ? identifier : Number(identifier);
      if (itemIndex < 0 || itemIndex >= items.length) return false;
    }

    // Calculate which page this item is on
    const itemPage = Math.floor(itemIndex / rowsPerPage) + 1;
    setPage(itemPage);
    return true;
  };

  return {
    // State
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    rowsPerPageOptions,

    // Derived values
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,

    // Methods
    handlePageChange,
    handleRowsPerPageChange,
    navigateToItem,
    nextPage: () => page < totalPages && setPage(page + 1),
    prevPage: () => page > 1 && setPage(page - 1),
    firstPage: () => setPage(1),
    lastPage: () => setPage(totalPages),
  };
};

export default usePagination;
