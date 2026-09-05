import { EntityCard, CardActionButtons, type CardActionItem } from "@/shared/components/cards";
import { EmptyState, NoResultsState } from "@/shared/components/feedback/states";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Archive, CalendarMonth, Edit, LockClock, Restore, Visibility } from "@mui/icons-material";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { FiscalYearListItem, FiscalYearPermissions } from "../types/FiscalYear";

interface Props {
  items: FiscalYearListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number; hasCriteria: boolean; permissions: FiscalYearPermissions;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onClear: () => void; onAdd: () => void;
  onView: (item: FiscalYearListItem) => void; onEdit: (item: FiscalYearListItem) => void; onArchive: (item: FiscalYearListItem) => void; onRestore: (item: FiscalYearListItem) => void; onLifecycle: (item: FiscalYearListItem) => void;
}

export default function FiscalYearsCardView(props: Props) {
  const { t } = useTranslation();
  if (props.loading) return <CardViewSkeleton />;
  if (!props.items.length && !props.hasCriteria) return <EmptyState title={t("fiscalYears.empty.title")} subtitle={t("fiscalYears.empty.subtitle")} actionText={props.permissions.canCreate ? t("fiscalYears.actions.add") : undefined} onAction={props.permissions.canCreate ? props.onAdd : undefined} />;
  if (!props.items.length) return <NoResultsState message={t("fiscalYears.noResults.title")} subtitle={t("fiscalYears.noResults.subtitle")} onClearFilters={props.onClear} />;
  const statusKey = (value: number) => ["", "draft", "open", "closing", "closed", "locked"][value];
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}>
      <Grid container spacing={3}>{props.items.map((item, index) => {
        const actions: CardActionItem[] = [
          { key: "view", title: t("actions.view"), color: "info", icon: <Visibility fontSize="small" />, onClick: () => props.onView(item) },
          { key: "edit", title: t("actions.edit"), color: "primary", icon: <Edit fontSize="small" />, onClick: () => props.onEdit(item), disabled: !props.permissions.canEdit || item.isDeleted || item.status !== 1 },
          { key: "lifecycle", title: t("fiscalYears.actions.lifecycle"), color: "success", icon: <LockClock fontSize="small" />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canManageLifecycle || item.isDeleted || item.status === 5 },
          item.isDeleted
            ? { key: "restore", title: t("actions.restore"), color: "success", icon: <Restore fontSize="small" />, onClick: () => props.onRestore(item), disabled: !props.permissions.canDelete }
            : { key: "archive", title: t("actions.archive"), color: "warning", icon: <Archive fontSize="small" />, onClick: () => props.onArchive(item), disabled: !props.permissions.canDelete || item.status !== 1 },
        ];
        return <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}><EntityCard index={index} height={300} title={item.nameEn} subtitle={`${item.nameAr} • ${item.code}`}
          endBadge={<Chip size="small" color={item.status === 2 ? "success" : item.status === 3 ? "warning" : "default"} label={t(`fiscalYears.status.${statusKey(item.status)}`)} />}
          chips={<Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}><Chip size="small" variant="outlined" label={t(item.periodFrequency === 1 ? "fiscalYears.frequency.monthly" : "fiscalYears.frequency.quarterly")} /><Chip size="small" variant="outlined" label={t("fiscalYears.periods.count", { count: item.periodsCount })} /></Stack>}
          content={<Stack spacing={1.25}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><CalendarMonth color="primary" fontSize="small" /><Typography variant="body2">{item.startDate} — {item.endDate}</Typography></Stack>{item.isDeleted ? <Chip size="small" color="warning" label={t("fiscalYears.recordStatus.archived")} /> : null}</Stack>}
          footer={<CardActionButtons actions={actions} />}
        /></Grid>;
      })}</Grid>
    </Box>
    <Box sx={{ flexShrink: 0, pt: 1.5 }}><CardViewPagination pinned page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount} itemsPerPageOptions={[5, 10, 25, 50]} itemsLabel={t("fiscalYears.totalLabel")} onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} /></Box>
  </Box>;
}
