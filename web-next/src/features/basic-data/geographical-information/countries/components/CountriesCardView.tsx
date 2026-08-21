import { CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CountriesCardViewProps } from "./card-view/CountryCard.types";
import {
  CountryCard,
  CountryCardViewPagination,
  EmptyState,
  NoResultsState,
} from "./card-view";

const pageSizeOptions = [5, 10, 25, 50];

const CountriesCardView = ({
  countries,
  loading,
  onEdit,
  onDelete,
  onRestore,
  onView,
  onAdd,
  onRefresh,
  permissions,
  lastAddedId,
  lastEditedId,
  page,
  pageSize,
  totalCount,
  hasActiveCriteria,
  onPageChange,
  onPageSizeChange,
  onClearCriteria,
  selectedCountryIds,
  onSelectedCountryIdsChange,
}: CountriesCardViewProps) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [expiredHighlightId, setExpiredHighlightId] = useState<string | number | null>(null);
  const highlightId = lastAddedId ?? lastEditedId;
  const highlightVisible = highlightId != null
    && expiredHighlightId !== highlightId
    && countries.some((country) => String(country.id) === String(highlightId));
  const highlightLabel = lastAddedId != null
    ? t("countries.highlight.new")
    : t("countries.highlight.edited");

  useEffect(() => {
    if (highlightId == null) return;
    const timer = setTimeout(() => setExpiredHighlightId(highlightId), 5_000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  if (loading) return <CardViewSkeleton />;

  if (countries.length === 0 && !hasActiveCriteria) {
    return <EmptyState onAdd={permissions.canCreate ? onAdd : undefined} />;
  }

  if (countries.length === 0) {
    return (
      <NoResultsState
        searchTerm=""
        onClearSearch={onClearCriteria}
        onClearFilters={onClearCriteria}
        onRefresh={onRefresh}
      />
    );
  }

  const handleSelectionChange = (countryId: number, selected: boolean) => {
    onSelectedCountryIdsChange(
      selected
        ? [...new Set([...selectedCountryIds, countryId])]
        : selectedCountryIds.filter((id) => id !== countryId),
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          p: { xs: 1, md: 1.5 },
          scrollbarGutter: "stable",
        }}
      >
        <Grid container spacing={3}>
          {countries.map((country, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={country.id}>
              <CountryCard
                country={country}
                index={index}
                isHovered={hoveredCard === country.id}
                isHighlighted={highlightVisible && String(highlightId) === String(country.id)}
                highlightLabel={highlightVisible && String(highlightId) === String(country.id)
                  ? highlightLabel
                  : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
                onView={onView}
                onHover={setHoveredCard}
                permissions={permissions}
                selected={selectedCountryIds.includes(country.id)}
                onSelectedChange={permissions.canDelete && !country.isDeleted
                  ? (selected) => handleSelectionChange(country.id, selected)
                  : undefined}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ flexShrink: 0, pt: 1.5, zIndex: 1 }}>
        <CountryCardViewPagination
          page={page}
          rowsPerPage={pageSize}
          totalItems={totalCount}
          itemsPerPageOptions={pageSizeOptions}
          pinned
          onPageChange={onPageChange}
          onRowsPerPageChange={onPageSizeChange}
        />
      </Box>
    </Box>
  );
};

export default CountriesCardView;
