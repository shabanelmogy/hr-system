export const goToLastPage = (
  data,
  searchText,
  searchType,
  searchFields,
  filters,
  pageSize,
  setCurrentPage,
  filterFunc,
  newItem = null
) => {
  // Include the new item in the data if provided
  const updatedData = newItem ? [...data, newItem] : data;

  // Apply the filter function with all required parameters in the new structure
  const filteredData = filterFunc(updatedData, {
    searchText,
    searchType,
    searchFields,
    filters,
  });

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  if (newItem) {
    // If we have a new item, find which page it would be on
    const newItemIndex = filteredData.findIndex(
      (item) => item.id === newItem.id
    );

    if (newItemIndex >= 0) {
      // If item is in filtered results, go to its page
      const itemPage = Math.ceil((newItemIndex + 1) / pageSize);
      setCurrentPage(itemPage);
    } else {
      // If item isn't in filtered results due to filters, go to last page
      setCurrentPage(totalPages);
    }
  } else {
    // If there's no new item, just ensure we're not on a page beyond total pages
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }
};

export const paginateData = (data, pageSize, currentPage) => {
  // Calculate the total number of pages
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize)); // Ensure at least 1 page

  // Calculate the start and end indices for slicing
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = currentPage * pageSize;

  // Slice the data to get the current page's items
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    totalPages, // Total number of pages
    paginatedData, // Data for the current page
  };
};
