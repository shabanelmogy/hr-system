// Then update the filterCases function to handle multiple search fields:
export const filterCases = (ListItems, options = {}) => {
  // Destructure with defaults
  const {
    searchText = [],
    searchType = "contains",
    searchField = null, // Keep for backward compatibility
    searchFields = [], // New array parameter for multiple fields
    filters = {},
  } = options;

  return ListItems.filter((item) => {
    let matchesSearch = true;
    let matchesFilters = true;

    // Apply dynamic filters
    matchesFilters = Object.entries(filters).every(([field, filterValue]) => {
      // Skip if filter value is null or 0 (assuming 0 means "no filter")
      if (filterValue === null || filterValue === 0) return true;
      // Check if the snippet's field matches the filter value
      return item[field] === filterValue;
    });

    // Apply search text filter
    if (
      searchText &&
      (Array.isArray(searchText) ? searchText.length > 0 : searchText)
    ) {
      // Convert searchText to array if it's a string (for backward compatibility)
      const searchTerms = Array.isArray(searchText) ? searchText : [searchText];

      // Determine which fields to search in
      let fieldsToSearch = [];

      // Handle the case where we have specific searchFields
      if (searchFields && searchFields.length > 0) {
        // Use the provided searchFields array
        fieldsToSearch = searchFields.includes("all")
          ? Object.keys(item)
          : searchFields;
      }
      // Backward compatibility with searchField (string)
      else if (searchField) {
        fieldsToSearch =
          searchField === "all" ? Object.keys(item) : [searchField];
      }
      // Default to all fields if nothing specified
      else {
        fieldsToSearch = Object.keys(item);
      }

      // Consider a match if all search terms match at least one field
      matchesSearch = searchTerms.every((term) => {
        const lowerCaseTerm =
          typeof term === "string" ? term.toLowerCase() : "";

        // Skip empty terms
        if (!lowerCaseTerm) return true;

        // Check if any field matches this term
        return fieldsToSearch.some((field) => {
          const value = item[field];
          const fieldValue =
            typeof value === "string"
              ? value.toLowerCase()
              : value === null || value === undefined
              ? ""
              : String(value).toLowerCase();

          switch (searchType) {
            case "contains":
              return fieldValue.includes(lowerCaseTerm);
            case "notcontains":
              return !fieldValue.includes(lowerCaseTerm);
            case "startswith":
              return fieldValue.startsWith(lowerCaseTerm);
            case "notstartswith":
              return !fieldValue.startsWith(lowerCaseTerm);
            case "endswith":
              return fieldValue.endsWith(lowerCaseTerm);
            case "notendswith":
              return !fieldValue.endsWith(lowerCaseTerm);
            case "equal":
              return fieldValue === lowerCaseTerm;
            case "notEqual":
              return fieldValue !== lowerCaseTerm;
            default:
              return true;
          }
        });
      });
    }

    return matchesFilters && matchesSearch;
  });
};
