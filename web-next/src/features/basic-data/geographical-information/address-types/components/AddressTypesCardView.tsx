import { CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Box, Grid } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { AddressTypesCardViewProps } from "./card-view/AddressTypeCard.types";
import AddressTypeCard from "./card-view/AddressTypeCard";
import AddressTypeCardViewPagination from "./card-view/AddressTypeCardViewPagination";
import EmptyState from "./card-view/EmptyState";
import NoResultsState from "./card-view/NoResultsState";

const pageSizeOptions = [5, 10, 25, 50];

export default function AddressTypesCardView(props: AddressTypesCardViewProps) {
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  if (props.loading) return <CardViewSkeleton />;
  if (props.items.length === 0 && !props.hasActiveCriteria) return <EmptyState onAdd={props.permissions.canCreate ? props.onAdd : undefined} />;
  if (props.items.length === 0) return <NoResultsState searchTerm="" onClearSearch={props.onClearCriteria} onClearFilters={props.onClearCriteria} onRefresh={props.onRefresh} />;
  const changeSelection = (id: number, selected: boolean) => props.onSelectedIdsChange(selected ? [...new Set([...props.selectedIds, id])] : props.selectedIds.filter((item) => item !== id));
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}><Box sx={{ flex: 1, minHeight: 0, overflowX: "hidden", overflowY: "auto", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}><Grid container spacing={3}>{props.items.map((item, index) => <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}><AddressTypeCard addressType={item} index={index} isHovered={hoveredCard === item.id} onHover={setHoveredCard} onView={props.onView} onEdit={props.onEdit} onDelete={props.onDelete} onRestore={props.onRestore} permissions={props.permissions} selected={props.selectedIds.includes(item.id)} onSelectedChange={props.permissions.canDelete && !item.isDeleted ? (selected) => changeSelection(item.id, selected) : undefined} /></Grid>)}</Grid></Box><Box sx={{ flexShrink: 0, pt: 1.5, zIndex: 1 }}><AddressTypeCardViewPagination page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount} itemsPerPageOptions={pageSizeOptions} pinned onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} /></Box></Box>;
}
