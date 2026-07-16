/* eslint-disable react/prop-types */
// components/AddressTypesCardView.jsx
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAddressTypeSearch } from "../hooks/useAddressTypeQueries";
import type { AddressType } from "../types/AddressType";
import {
  AddressTypeCardViewHeader,
  AddressTypeCardViewPagination,
  AddressTypeCard,
  EmptyState,
  NoResultsState
} from "./card-view";

import { AddressTypesCardViewProps } from "./card-view/AddressTypeCard.types";
import { CardViewSkeleton } from "@/shared/components/lists/card-view";

const AddressTypesCardView = ({
  items,
  loading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: AddressTypesCardViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | number | null>(null);
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  // Search derived state using the new hook
  const normalizedSearch = useMemo(() => {
    const s = searchTerm.trim();
    return s.startsWith("+") ? s.slice(1) : s;
  }, [searchTerm]);
  const searchedAddressTypes = useAddressTypeSearch(normalizedSearch, items || []);

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Responsive items per page calculation
  const getResponsiveItemsPerPage = () => {
    if (isXs) return 6;   // Mobile: 1 column
    if (isSm) return 8;   // Small tablet: 2 columns
    if (isMd) return 12;  // Medium tablet: 3 columns
    if (isLg) return 12;  // Desktop: 4 columns
    if (isXl) return 12;  // Large desktop: 5+ columns
    return 12; // Default
  };

  // Pagination state with responsive default
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => getResponsiveItemsPerPage());

  // Update items per page when screen size changes
  useEffect(() => {
    const newItemsPerPage = getResponsiveItemsPerPage();
    if (newItemsPerPage !== rowsPerPage) {
      setRowsPerPage(newItemsPerPage);
      setPage(0); // Reset to first page
    }
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPage(0);
  }, [normalizedSearch, filterBy, sortBy]);

  // Enhanced data processing with search, filter, and sort
  const processedAddressTypes = useMemo(() => {
    if (!items) return [];

    let filteredAddressTypes = [...searchedAddressTypes];

    // Apply additional filters
    if (filterBy !== "all") {
      switch (filterBy) {
        case "recent":
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredAddressTypes = filteredAddressTypes.filter(addressType =>
            addressType.createdOn && new Date(addressType.createdOn) > thirtyDaysAgo
          );
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filteredAddressTypes.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.nameEn || "").localeCompare(b.nameEn || "");
          break;
        case "created":
          comparison = new Date(a.createdOn || 0).getTime() - new Date(b.createdOn || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredAddressTypes;
  }, [searchedAddressTypes, sortBy, sortOrder, filterBy]);

  // Handle highlighting and navigation for add/edit/delete operations
  useEffect(() => {
    if (lastAddedId && processedAddressTypes.length > 0) {
      // Navigate to the newly added address type in the processed (sorted) list
      const addedAddressTypeIndex = processedAddressTypes.findIndex(c => c.id === lastAddedId);
      if (addedAddressTypeIndex !== -1) {
        const targetPage = Math.floor(addedAddressTypeIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastAddedId);
        setHighlightLabel('New');

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log("🎯 CardView: Added address type not found in processed address types list");
      }
    }
  }, [lastAddedId, processedAddressTypes, rowsPerPage]);

  useEffect(() => {
    if (lastEditedId && processedAddressTypes.length > 0) {
      // Navigate to the edited address type in the processed (sorted) list
      const editedAddressTypeIndex = processedAddressTypes.findIndex(c => c.id === lastEditedId);
      if (editedAddressTypeIndex !== -1) {
        const targetPage = Math.floor(editedAddressTypeIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastEditedId);
        setHighlightLabel('Edited');

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log("🎯 CardView: Edited address type not found in processed address types list");
      }
    }
  }, [lastEditedId, processedAddressTypes, rowsPerPage]);

  useEffect(() => {
    if (lastDeletedIndex !== null && lastDeletedIndex !== undefined && processedAddressTypes.length > 0) {

      // Navigate to the previous address type or stay on same page in the processed list
      const targetIndex = Math.max(0, Math.min(lastDeletedIndex - 1, processedAddressTypes.length - 1));
      const targetPage = Math.floor(targetIndex / rowsPerPage);
      setPage(targetPage);

      // Highlight the previous address type if it exists
      if (processedAddressTypes[targetIndex]) {
        setHighlightedCard(processedAddressTypes[targetIndex].id);
        setHighlightLabel(null);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      }
    }
  }, [lastDeletedIndex, processedAddressTypes, rowsPerPage]);

  // Paginated data
  const paginatedAddressTypes = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedAddressTypes.slice(startIndex, startIndex + rowsPerPage);
  }, [processedAddressTypes, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    void event;
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0);
  };

  // Enhanced onAdd function
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    }
  };

  // Get responsive items per page options
  const getItemsPerPageOptions = () => {
    // For larger screens (lg and xl), use fixed options: 12, 24, 36, 48
    if (isLg || isXl) {
      return [12, 24, 36, 48];
    }

    const base = getResponsiveItemsPerPage();
    return [
      Math.max(4, Math.floor(base * 0.5)),  // Half
      base,                                  // Default
      Math.floor(base * 1.5),               // 1.5x
      base * 2,                             // Double
      base * 3                              // Triple
    ].filter((value, index, array) => array.indexOf(value) === index); // Remove duplicates
  };

  // Handler functions
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSortBy('created');
    setSortOrder('asc');
    setFilterBy('all');
    setPage(0);
  };

  if (loading) {
    return <CardViewSkeleton />;
  }

  if (!items || items.length === 0) {
    return <EmptyState onAdd={handleAdd} />;
  }

  return (
    <Box>
      <AddressTypeCardViewHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterBy={filterBy}
        processedAddressTypesLength={processedAddressTypes.length}
        page={page}
        onSearchChange={handleSearchChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterByChange={setFilterBy}
        onClearSearch={handleClearSearch}
        onReset={handleReset}
      />

      <Grid container spacing={3}>
        {paginatedAddressTypes.map((addressType, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={addressType.id}>
            <AddressTypeCard
              addressType={addressType}
              index={index}
              isHovered={hoveredCard === addressType.id}
              isHighlighted={highlightedCard === addressType.id}
              highlightLabel={highlightedCard === addressType.id ? highlightLabel ?? undefined : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onHover={setHoveredCard}
            />
          </Grid>
        ))}
      </Grid>

      {processedAddressTypes.length > 0 && (
        <AddressTypeCardViewPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={processedAddressTypes.length}
          itemsPerPageOptions={getItemsPerPageOptions()}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {searchTerm && processedAddressTypes.length === 0 && (
        <NoResultsState
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
          onClearFilters={filterBy !== 'all' ? () => setFilterBy('all') : undefined}
          onRefresh={onRefresh}
        />
      )}
    </Box>
  );
};

export default AddressTypesCardView;
export type { AddressType };
