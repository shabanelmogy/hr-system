import { CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Box, Grid } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
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
}: CountriesCardViewProps) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [highlightedCard, setHighlightedCard] = useState<string | number | null>(null);
  const [highlightLabel, setHighlightLabel] = useState<string | null>(null);

  useEffect(() => {
    const id = lastAddedId ?? lastEditedId;
    if (id == null || !countries.some((country) => String(country.id) === String(id))) return;

    setHighlightedCard(id);
    setHighlightLabel(lastAddedId != null ? t("countries.highlight.new") : t("countries.highlight.edited"));
    const timer = setTimeout(() => {
      setHighlightedCard(null);
      setHighlightLabel(null);
    }, 5_000);
    return () => clearTimeout(timer);
  }, [countries, lastAddedId, lastEditedId, t]);

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

  const handleRowsPerPageChange = (event: SelectChangeEvent<number>) => {
    onPageSizeChange(Number(event.target.value));
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {countries.map((country, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={country.id}>
            <CountryCard
              country={country}
              index={index}
              isHovered={hoveredCard === country.id}
              isHighlighted={highlightedCard === country.id}
              highlightLabel={highlightedCard === country.id ? highlightLabel ?? undefined : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onView={onView}
              onHover={setHoveredCard}
              permissions={permissions}
            />
          </Grid>
        ))}
      </Grid>

      <CountryCardViewPagination
        page={page}
        rowsPerPage={pageSize}
        totalItems={totalCount}
        itemsPerPageOptions={pageSizeOptions}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default CountriesCardView;
