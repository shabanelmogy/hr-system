/* eslint-disable react/prop-types */
// components/CountriesCardView.jsx
import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { filterCountries } from "../hooks/useCountryQueries";
import type { Country } from "../types/Country";
import {
  CountryCardViewHeader,
  CountryCardViewPagination,
  CountryCard,
  EmptyState,
  NoResultsState
} from "./card-view";
import { CardViewSkeleton } from "@/shared/components/lists/card-view";

import { CountriesCardViewProps } from "./card-view/CountryCard.types";

const CountriesCardView = ({
  countries,
  loading,
  onEdit,
  onDelete,
  onView,
  onAdd,
  onRefresh,
  lastAddedId,
  lastEditedId,
  lastDeletedIndex,
}: CountriesCardViewProps) => {
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
  const searchedCountries = useMemo(
    () => filterCountries(normalizedSearch, countries || []),
    [normalizedSearch, countries]
  );

  // Responsive breakpoints
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMd = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLg = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const isXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Derived once per breakpoint change — replaces the repeated getResponsiveItemsPerPage() calls
  const responsiveItemsPerPage = useMemo(() => {
    if (isXs) return 6;   // Mobile: 1 column
    if (isSm) return 8;   // Small tablet: 2 columns
    if (isMd) return 12;  // Medium tablet: 3 columns
    if (isLg) return 12;  // Desktop: 4 columns
    if (isXl) return 12;  // Large desktop: 5+ columns
    return 12;
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Pagination state with responsive default
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(() => responsiveItemsPerPage);

  // Update items per page when screen size changes
  useEffect(() => {
    if (responsiveItemsPerPage !== rowsPerPage) {
      setRowsPerPage(responsiveItemsPerPage);
      setPage(0);
    }
  }, [responsiveItemsPerPage, rowsPerPage]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPage(0);
  }, [normalizedSearch, filterBy, sortBy]);

  // Enhanced data processing with search, filter, and sort
  const processedCountries = useMemo(() => {
    if (!countries) return [];

    let filteredCountries = [...searchedCountries];

    // Apply additional filters
    if (filterBy !== "all") {
      switch (filterBy) {
        case "recent":
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filteredCountries = filteredCountries.filter(country =>
            country.createdOn && new Date(country.createdOn) > thirtyDaysAgo
          );
          break;
        case "hasPhone":
          filteredCountries = filteredCountries.filter(country => country.phoneCode);
          break;
        case "hasCurrency":
          filteredCountries = filteredCountries.filter(country => country.currencyCode);
          break;
        default:
          break;
      }
    }

    // Apply sorting
    filteredCountries.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.nameEn || "").localeCompare(b.nameEn || "");
          break;
        case "alpha2":
          comparison = (a.alpha2Code || "").localeCompare(b.alpha2Code || "");
          break;
        case "alpha3":
          comparison = (a.alpha3Code || "").localeCompare(b.alpha3Code || "");
          break;
        case "phone": {
          const phoneA = Number(a.phoneCode) || 0;
          const phoneB = Number(b.phoneCode) || 0;
          comparison = phoneA - phoneB;
          break;
        }
        case "currency":
          comparison = (a.currencyCode || "").localeCompare(b.currencyCode || "");
          break;
        case "created":
          comparison = new Date(a.createdOn || 0).getTime() - new Date(b.createdOn || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filteredCountries;
  }, [searchedCountries, sortBy, sortOrder, filterBy, countries]);

  // Handle highlighting and navigation for add/edit/delete operations
  useEffect(() => {
    if (lastAddedId && processedCountries.length > 0) {
      // Navigate to the newly added country in the processed (sorted) list
      const addedCountryIndex = processedCountries.findIndex(c => c.id === lastAddedId);
      if (addedCountryIndex !== -1) {
        const targetPage = Math.floor(addedCountryIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastAddedId);
        setHighlightLabel('New');

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        // country not yet in processed list — effect will re-run when data updates
      }
    }
  }, [lastAddedId, processedCountries, rowsPerPage]);

  useEffect(() => {
    if (lastEditedId && processedCountries.length > 0) {
      // Navigate to the edited country in the processed (sorted) list
      const editedCountryIndex = processedCountries.findIndex(c => c.id === lastEditedId);
      if (editedCountryIndex !== -1) {
        const targetPage = Math.floor(editedCountryIndex / rowsPerPage);
        setPage(targetPage);
        setHighlightedCard(lastEditedId);
        setHighlightLabel('Edited');

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      } else {
        // country not yet in processed list — effect will re-run when data updates
      }
    }
  }, [lastEditedId, processedCountries, rowsPerPage]);

  useEffect(() => {
    if (lastDeletedIndex !== null && lastDeletedIndex !== undefined && processedCountries.length > 0) {

      // Navigate to the previous country or stay on same page in the processed list
      const targetIndex = Math.max(0, Math.min(lastDeletedIndex - 1, processedCountries.length - 1));
      const targetPage = Math.floor(targetIndex / rowsPerPage);
      setPage(targetPage);

      // Highlight the previous country if it exists
      if (processedCountries[targetIndex]) {
        setHighlightedCard(processedCountries[targetIndex].id);
        setHighlightLabel(null);

        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedCard(null);
          setHighlightLabel(null);
        }, 5000);
      }
    }
  }, [lastDeletedIndex, processedCountries, rowsPerPage]);

  // Paginated data
  const paginatedCountries = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return processedCountries.slice(startIndex, startIndex + rowsPerPage);
  }, [processedCountries, page, rowsPerPage]);

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

    const base = responsiveItemsPerPage;
    return [
      Math.max(4, Math.floor(base * 0.5)),
      base,
      Math.floor(base * 1.5),
      base * 2,
      base * 3,
    ].filter((value, index, array) => array.indexOf(value) === index);
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

  if (!countries || countries.length === 0) {
    return <EmptyState onAdd={handleAdd} />;
  }

  return (
    <Box>
      <CountryCardViewHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        filterBy={filterBy}
        processedCountriesLength={processedCountries.length}
        page={page}
        onSearchChange={handleSearchChange}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onFilterByChange={setFilterBy}
        onClearSearch={handleClearSearch}
        onReset={handleReset}
      />

      <Grid container spacing={3}>
        {paginatedCountries.map((country, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={country.id}>
            <CountryCard
              country={country}
              index={index}
              isHovered={hoveredCard === country.id}
              isHighlighted={highlightedCard === country.id}
              highlightLabel={highlightedCard === country.id ? highlightLabel ?? undefined : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onHover={setHoveredCard}
            />
          </Grid>
        ))}
      </Grid>

      {processedCountries.length > 0 && (
        <CountryCardViewPagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={processedCountries.length}
          itemsPerPageOptions={getItemsPerPageOptions()}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}

      {searchTerm && processedCountries.length === 0 && (
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

export default CountriesCardView;
