/* eslint-disable react/prop-types */
// components/StatesCardView.tsx
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  StateCardViewHeader,
  StateCardViewPagination,
  StateCard,
  EmptyState,
  NoResultsState
} from "./card-view";
import { CardViewSkeleton } from "@/shared/components/lists/card-view";
import { StatesCardViewProps } from "./card-view/StateCard.types";

const StatesCardView = ({
  states,
  loading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: StatesCardViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | number | null>(null);
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  // Search functionality
  const searchedStates = useMemo(() => {
    if (!searchTerm.trim()) return states || [];
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    return (states || []).filter(state => 
      state.nameEn?.toLowerCase().includes(normalizedSearch) ||
      state.nameAr?.toLowerCase().includes(normalizedSearch) ||
      state.code?.toLowerCase().includes(normalizedSearch) ||
      state.country?.nameEn?.toLowerCase().includes(normalizedSearch) ||
      state.country?.nameAr?.toLowerCase().includes(normalizedSearch)
    );
  }, [searchTerm, states]);

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
  }, [searchTerm, filterBy, sortBy]);

  // Enhanced data processing with search, filter, and sort
  const processedStates = useMemo(() => {
    if (!states) return [];

    let filteredStates = [...searchedStates];

    // Apply additional filters for recent N days only
    if (filterBy !== "all" && filterBy.startsWith("recent")) {
      const days = parseInt(filterBy.replace("recent", ""), 10);
      if (!Number.isNaN(days)) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        filteredStates = filteredStates.filter(
          (state) => state.createdOn && new Date(state.createdOn) > cutoff
        );
      }
    }

    // Apply sorting
    filteredStates.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.nameEn || "").localeCompare(b.nameEn || "");
          break;
        case "code":
          comparison = (a.code || "").localeCompare(b.code || "");
          break;
        case "country":
          comparison = (a.country?.nameEn || "").localeCompare(b.country?.nameEn || "");
          break;
        case "created":
          comparison = new Date(a.createdOn || 0).getTime() - new Date(b.createdOn || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredStates;
  }, [searchedStates, sortBy, sortOrder, filterBy]);

  // Handle highlighting and navigation for add/edit/delete operations
  useEffect(() => {
    if (lastAddedId && processedStates.length > 0) {
      // Navigate to the newly added state in the processed (sorted) list
      const addedStateIndex = processedStates.findIndex(s => s.id === lastAddedId);
      if (addedStateIndex !== -1) {
        const targetPage = Math.floor(addedStateIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastAddedId);
        setHighlightLabel('New');

        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log("🎯 CardView: Added state not found in processed states list");
      }
    }
  }, [lastAddedId, processedStates, rowsPerPage]);

  useEffect(() => {
    if (lastEditedId && processedStates.length > 0) {
      // Navigate to the edited state in the processed (sorted) list
      const editedStateIndex = processedStates.findIndex(s => s.id === lastEditedId);
      if (editedStateIndex !== -1) {
        const targetPage = Math.floor(editedStateIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastEditedId);
        setHighlightLabel('Edited');

        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log("🎯 CardView: Edited state not found in processed states list");
      }
    }
  }, [lastEditedId, processedStates, rowsPerPage]);

  useEffect(() => {
    if (lastDeletedIndex !== null && lastDeletedIndex !== undefined && processedStates.length > 0) {
      // Navigate to the previous state or stay on same page in the processed list
      const targetIndex = Math.max(0, Math.min(lastDeletedIndex - 1, processedStates.length - 1));
      const targetPage = Math.floor(targetIndex / rowsPerPage);
      setPage(targetPage);

      // Highlight the previous state if it exists
      if (processedStates[targetIndex]) {
        setHighlightedCard(processedStates[targetIndex].id);
        setHighlightLabel(null);

        // Clear highlight after 5 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      }
    }
  }, [lastDeletedIndex, processedStates, rowsPerPage]);

  // Paginated data
  const paginatedStates = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedStates.slice(startIndex, startIndex + rowsPerPage);
  }, [processedStates, page, rowsPerPage]);

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

  if (!states || states.length === 0) {
    return <EmptyState onAdd={handleAdd} />;
  }

  return (
    <Box>
      <StateCardViewHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterBy={filterBy}
        processedStatesLength={processedStates.length}
        page={page}
        onSearchChange={handleSearchChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterByChange={setFilterBy}
        onClearSearch={handleClearSearch}
        onReset={handleReset}
      />

      <Grid container spacing={3}>
        {paginatedStates.map((state, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={state.id}>
            <StateCard
              state={state}
              index={index}
              isHovered={hoveredCard === state.id}
              isHighlighted={highlightedCard === state.id}
              highlightLabel={highlightedCard === state.id ? highlightLabel ?? undefined : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onHover={setHoveredCard}
            />
          </Grid>
        ))}
      </Grid>

      {processedStates.length > 0 && (
        <StateCardViewPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={processedStates.length}
          itemsPerPageOptions={getItemsPerPageOptions()}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {searchTerm && processedStates.length === 0 && (
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

export default StatesCardView;
