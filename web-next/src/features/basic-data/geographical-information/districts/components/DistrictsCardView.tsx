/* eslint-disable react/prop-types */
// components/DistrictsCardView.jsx
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDistrictSearch } from "../hooks/useDistrictQueries";
import type { District } from "../types/District";
import {
  DistrictCardViewHeader,
  DistrictCardViewPagination,
  DistrictCard,
  EmptyState,
  NoResultsState,
} from "./card-view";
import { DistrictsCardViewProps } from "./card-view/DistrictCard.types";
import { CardViewSkeleton } from "@/shared/components/lists/card-view";

const DistrictsCardView = ({
  districts,
  loading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: DistrictsCardViewProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterBy, setFilterBy] = useState("all");
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<
    string | number | null
  >(null);
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  // Search derived state using the new hook
  const normalizedSearch = useMemo(() => {
    const s = searchTerm.trim();
    return s.startsWith("+") ? s.slice(1) : s;
  }, [searchTerm]);
  const searchedDistricts = useDistrictSearch(
    normalizedSearch,
    districts || []
  );

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.between("lg", "xl"));
  const isXl = useMediaQuery(theme.breakpoints.up("xl"));

  // Responsive items per page calculation
  const getResponsiveItemsPerPage = () => {
    if (isXs) return 6; // Mobile: 1 column
    if (isSm) return 8; // Small tablet: 2 columns
    if (isMd) return 12; // Medium tablet: 3 columns
    if (isLg) return 12; // Desktop: 4 columns
    if (isXl) return 12; // Large desktop: 5+ columns
    return 12; // Default
  };

  // Pagination state with responsive default
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() =>
    getResponsiveItemsPerPage()
  );

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
  const processedDistricts = useMemo(() => {
    if (!districts) return [];

    let filteredDistricts = [...searchedDistricts];

    // Apply additional filters
    if (filterBy !== "all") {
      switch (filterBy) {
        case "recent":
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredDistricts = filteredDistricts.filter(
            (district) =>
              district.createdOn && new Date(district.createdOn) > thirtyDaysAgo
          );
          break;
        case "hasState":
          filteredDistricts = filteredDistricts.filter(
            (district) => district.stateId
          );
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filteredDistricts.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.nameEn || "").localeCompare(b.nameEn || "");
          break;
        case "code":
          comparison = (a.code || "").localeCompare(b.code || "");
          break;
        case "state":
          comparison = (a.state?.nameEn || "").localeCompare(
            b.state?.nameEn || ""
          );
          break;
        case "created":
          comparison =
            new Date(a.createdOn || 0).getTime() -
            new Date(b.createdOn || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredDistricts;
  }, [searchedDistricts, sortBy, sortOrder, filterBy]);

  // Handle highlighting and navigation for add/edit/delete operations
  useEffect(() => {
    if (lastAddedId && processedDistricts.length > 0) {
      // Navigate to the newly added district in the processed (sorted) list
      const addedDistrictIndex = processedDistricts.findIndex(
        (d) => d.id === lastAddedId
      );
      if (addedDistrictIndex !== -1) {
        const targetPage = Math.floor(addedDistrictIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastAddedId);
        setHighlightLabel("New");

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log(
          "🎯 CardView: Added district not found in processed districts list"
        );
      }
    }
  }, [lastAddedId, processedDistricts, rowsPerPage]);

  useEffect(() => {
    if (lastEditedId && processedDistricts.length > 0) {
      // Navigate to the edited district in the processed (sorted) list
      const editedDistrictIndex = processedDistricts.findIndex(
        (d) => d.id === lastEditedId
      );
      if (editedDistrictIndex !== -1) {
        const targetPage = Math.floor(editedDistrictIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastEditedId);
        setHighlightLabel("Edited");

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        console.log(
          "🎯 CardView: Edited district not found in processed districts list"
        );
      }
    }
  }, [lastEditedId, processedDistricts, rowsPerPage]);

  useEffect(() => {
    if (
      lastDeletedIndex !== null &&
      lastDeletedIndex !== undefined &&
      processedDistricts.length > 0
    ) {
      // Navigate to the previous district or stay on same page in the processed list
      const targetIndex = Math.max(
        0,
        Math.min(lastDeletedIndex - 1, processedDistricts.length - 1)
      );
      const targetPage = Math.floor(targetIndex / rowsPerPage);
      setPage(targetPage);

      // Highlight the previous district if it exists
      if (processedDistricts[targetIndex]) {
        setHighlightedCard(processedDistricts[targetIndex].id);
        setHighlightLabel(null);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      }
    }
  }, [lastDeletedIndex, processedDistricts, rowsPerPage]);

  // Paginated data
  const paginatedDistricts = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedDistricts.slice(startIndex, startIndex + rowsPerPage);
  }, [processedDistricts, page, rowsPerPage]);

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
      Math.max(4, Math.floor(base * 0.5)), // Half
      base, // Default
      Math.floor(base * 1.5), // 1.5x
      base * 2, // Double
      base * 3, // Triple
    ].filter((value, index, array) => array.indexOf(value) === index); // Remove duplicates
  };

  // Handler functions
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(0);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSortBy("created");
    setSortOrder("asc");
    setFilterBy("all");
    setPage(0);
  };

  if (loading) {
    return <CardViewSkeleton />;
  }

  if (!districts || districts.length === 0) {
    return <EmptyState onAdd={handleAdd} />;
  }

  return (
    <Box>
      <DistrictCardViewHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterBy={filterBy}
        processedDistrictsLength={processedDistricts.length}
        page={page}
        onSearchChange={handleSearchChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterByChange={setFilterBy}
        onClearSearch={handleClearSearch}
        onReset={handleReset}
      />

      <Grid container spacing={3}>
        {paginatedDistricts.map((district, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={district.id}>
            <DistrictCard
              district={district}
              index={index}
              isHovered={hoveredCard === district.id}
              isHighlighted={highlightedCard === district.id}
              highlightLabel={
                highlightedCard === district.id
                  ? highlightLabel ?? undefined
                  : undefined
              }
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onHover={setHoveredCard}
            />
          </Grid>
        ))}
      </Grid>

      {processedDistricts.length > 0 && (
        <DistrictCardViewPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={processedDistricts.length}
          itemsPerPageOptions={getItemsPerPageOptions()}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {searchTerm && processedDistricts.length === 0 && (
        <NoResultsState
          searchTerm={searchTerm}
          onClearSearch={handleClearSearch}
          onClearFilters={
            filterBy !== "all" ? () => setFilterBy("all") : undefined
          }
          onRefresh={onRefresh}
        />
      )}
    </Box>
  );
};

export default DistrictsCardView;
