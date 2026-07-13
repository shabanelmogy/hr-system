import { useState, useEffect, useMemo } from "react";

const usePagination = (items = [], options = {}) => {
  const {
    initialPage = 1,
    initialRowsPerPage = 10,
    rowsPerPageOptions = [5, 10, 25],
  } = options;

  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Derived values
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

  // Get current page items
  const paginatedItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Handler for rows per page change
  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page when changing items per page
  };

  // Handler for page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Navigate to specific item by index or id
  const navigateToItem = (identifier, isId = false) => {
    let itemIndex;

    if (isId) {
      // Find item by ID and get its index
      itemIndex = items.findIndex((item) => item.id === identifier);
      if (itemIndex === -1) return false;
    } else {
      // Direct index
      itemIndex = identifier;
      if (itemIndex < 0 || itemIndex >= items.length) return false;
    }

    // Calculate which page this item is on
    const itemPage = Math.floor(itemIndex / rowsPerPage) + 1;
    setPage(itemPage);
    return true;
  };

  // Ensure current page is valid when data or rowsPerPage changes
  useEffect(() => {
    if (totalItems === 0) {
      if (page !== 1) setPage(1);
      return;
    }

    const maxValidPage = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    if (page > maxValidPage) {
      setPage(maxValidPage);
    }
  }, [totalItems, rowsPerPage, page]);

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
