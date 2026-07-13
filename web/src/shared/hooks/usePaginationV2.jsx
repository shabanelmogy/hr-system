// usePagination.js
import { useState, useEffect } from "react";

const usePaginationV2 = (
  initialPage = 1,
  initialRowsPerPage = 5,
  totalItems,
  onItemsChange = false
) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Reset page when adding/deleting items
  useEffect(() => {
    if (onItemsChange) {
      // Check if current page is now empty
      const totalPages = Math.ceil(totalItems / rowsPerPage);
      if (page > totalPages && totalPages > 0) {
        setPage(totalPages);
      }
    }
  }, [onItemsChange, totalItems, page, rowsPerPage]);

  return {
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
  };
};

export default usePaginationV2;
