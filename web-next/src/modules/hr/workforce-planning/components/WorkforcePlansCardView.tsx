import { CardActionButtons, EntityCard, type CardActionItem } from "@/shared/components/cards";
import { EmptyState, NoResultsState } from "@/shared/components/feedback/states";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Archive, CheckCircle, Edit, PeopleAlt, RateReview, Redo, Restore, Send, Undo, Visibility } from "@mui/icons-material";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { WorkforcePlanListItem, WorkforcePlanPermissions } from "../types/WorkforcePlan";

interface Props {
  items: WorkforcePlanListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number; hasCriteria: boolean; permissions: WorkforcePlanPermissions;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onClear: () => void; onAdd: () => void;
  onView: (item: WorkforcePlanListItem) => void; onEdit: (item: WorkforcePlanListItem) => void; onLifecycle: (item: WorkforcePlanListItem) => void; onReject: (item: WorkforcePlanListItem) => void; onArchive: (item: WorkforcePlanListItem) => void; onRestore: (item: WorkforcePlanListItem) => void;
}

const statusKeys = ["", "draft", "submitted", "underReview", "approved", "rejected", "superseded"];

export default function WorkforcePlansCardView(props: Props) {
  const { t } = useTranslation();
  if (props.loading) return <CardViewSkeleton />;
  if (!props.items.length && !props.hasCriteria) return <EmptyState title={t("workforcePlanning.empty.title")} subtitle={t("workforcePlanning.empty.subtitle")} actionText={props.permissions.canCreate ? t("workforcePlanning.actions.add") : undefined} onAction={props.permissions.canCreate ? props.onAdd : undefined} />;
  if (!props.items.length) return <NoResultsState message={t("workforcePlanning.noResults.title")} subtitle={t("workforcePlanning.noResults.subtitle")} onClearFilters={props.onClear} />;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}>
      <Grid container spacing={3}>{props.items.map((item, index) => {
        const lifecycleAction: CardActionItem = item.status === 2
          ? { key: "begin-review", title: t("workforcePlanning.actions.beginReview"), color: "warning", icon: <RateReview />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canApprove }
          : item.status === 3
            ? { key: "approve", title: t("workforcePlanning.actions.approve"), color: "success", icon: <CheckCircle />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canApprove }
            : [4, 6].includes(item.status)
              ? { key: "create-revision", title: t("workforcePlanning.actions.createRevision"), color: "info", icon: <Redo />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canCreate }
              : { key: "submit", title: t("workforcePlanning.actions.submit"), color: "primary", icon: <Send />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canEdit };
        const actions: CardActionItem[] = [
          { key: "view", title: t("actions.view"), color: "info", icon: <Visibility />, onClick: () => props.onView(item) },
          { key: "edit", title: t("actions.edit"), color: "primary", icon: <Edit />, onClick: () => props.onEdit(item), disabled: item.isDeleted || !props.permissions.canEdit || ![1, 5].includes(item.status) },
          { ...lifecycleAction, disabled: item.isDeleted || lifecycleAction.disabled },
          { key: "reject", title: t("workforcePlanning.actions.reject"), color: "error", icon: <Undo />, onClick: () => props.onReject(item), disabled: item.isDeleted || !props.permissions.canApprove || item.status !== 3 },
          item.isDeleted
            ? { key: "restore", title: t("workforcePlanning.actions.restore"), color: "success", icon: <Restore />, onClick: () => props.onRestore(item), disabled: !props.permissions.canRestore }
            : { key: "archive", title: t("workforcePlanning.actions.archive"), color: "error", icon: <Archive />, onClick: () => props.onArchive(item), disabled: !props.permissions.canArchive || ![1, 5].includes(item.status) },
        ];
        return <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}><EntityCard index={index} height={300} title={item.titleEn} subtitle={`${item.titleAr} • ${item.planCode}`}
          endBadge={<Stack spacing={.5} sx={{ alignItems: "flex-end" }}><Chip size="small" color={item.status === 4 ? "success" : item.status === 5 ? "error" : "info"} label={t(`workforcePlanning.status.${statusKeys[item.status]}`)} />{item.isDeleted ? <Chip size="small" variant="outlined" label={t("workforcePlanning.recordStatus.archived")} /> : null}</Stack>}
          chips={<Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}><Chip size="small" variant="outlined" label={t("workforcePlanning.revisions.short", { revision: item.revisionNumber })} /><Chip size="small" variant="outlined" label={t("workforcePlanning.lines.count", { count: item.linesCount })} /></Stack>}
          content={<Stack spacing={1.25}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><PeopleAlt color="primary" fontSize="small" /><Typography variant="body2">{t("workforcePlanning.slots.count", { count: item.plannedHiringSlots })}</Typography></Stack><Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}><Chip size="small" variant="outlined" label={t("workforcePlanning.slots.new", { count: item.newHireSlots })} /><Chip size="small" variant="outlined" label={t("workforcePlanning.slots.replacement", { count: item.replacementSlots })} /></Stack>{item.isEffective ? <Chip size="small" color="success" label={t("workforcePlanning.effective")} /> : null}</Stack>}
          footer={<CardActionButtons actions={actions} />}
        /></Grid>;
      })}</Grid>
    </Box>
    <Box sx={{ flexShrink: 0, pt: 1.5 }}><CardViewPagination pinned page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount} itemsPerPageOptions={[5, 10, 25, 50]} itemsLabel={t("workforcePlanning.totalLabel")} onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} /></Box>
  </Box>;
}
