import { CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StatesCardViewProps } from "./card-view/StateCard.types";
import {
  EmptyState,
  NoResultsState,
  StateCard,
  StateCardViewPagination,
} from "./card-view";

const pageSizeOptions = [5, 10, 25, 50];

const StatesCardView = ({
  states,
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
  searchValue,
  hasActiveCriteria,
  onPageChange,
  onPageSizeChange,
  onClearCriteria,
  selectedStateIds,
  onSelectedStateIdsChange,
}: StatesCardViewProps) => {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);
  const [expiredHighlightId, setExpiredHighlightId] = useState<string | number | null>(null);
  const highlightId = lastAddedId ?? lastEditedId;
  const highlightVisible = highlightId != null
    && expiredHighlightId !== highlightId
    && states.some((state) => String(state.id) === String(highlightId));
  const highlightLabel = lastAddedId != null
    ? t("states.highlight.new")
    : t("states.highlight.edited");

  useEffect(() => {
    if (highlightId == null) return;
    const timer = setTimeout(() => setExpiredHighlightId(highlightId), 5_000);
    return () => clearTimeout(timer);
  }, [highlightId]);

  if (loading) return <CardViewSkeleton />;

  if (states.length === 0 && !hasActiveCriteria) {
    return <EmptyState onAdd={permissions.canCreate ? onAdd : undefined} />;
  }

  if (states.length === 0) {
    return (
      <NoResultsState
        searchTerm={searchValue}
        onClearSearch={onClearCriteria}
        onClearFilters={onClearCriteria}
        onRefresh={onRefresh}
      />
    );
  }

  const handleSelectionChange = (stateId: number, selected: boolean) => {
    onSelectedStateIdsChange(
      selected
        ? [...new Set([...selectedStateIds, stateId])]
        : selectedStateIds.filter((id) => id !== stateId),
    );
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {states.map((state, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={state.id}>
            <StateCard
              state={state}
              index={index}
              isHovered={hoveredCard === state.id}
              isHighlighted={highlightVisible && String(highlightId) === String(state.id)}
              highlightLabel={highlightVisible && String(highlightId) === String(state.id)
                ? highlightLabel
                : undefined}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
              onView={onView}
              onHover={setHoveredCard}
              permissions={permissions}
              selected={selectedStateIds.includes(state.id)}
              onSelectedChange={permissions.canDelete && !state.isDeleted
                ? (selected) => handleSelectionChange(state.id, selected)
                : undefined}
            />
          </Grid>
        ))}
      </Grid>

      <StateCardViewPagination
        page={page}
        rowsPerPage={pageSize}
        totalItems={totalCount}
        itemsPerPageOptions={pageSizeOptions}
        onPageChange={onPageChange}
        onRowsPerPageChange={onPageSizeChange}
      />
    </Box>
  );
};

export default StatesCardView;
