import { CardActionButtons, EntityCard, type CardActionItem } from "@/shared/components/cards";
import { EmptyState, NoResultsState } from "@/shared/components/feedback/states";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { CheckCircle, Edit, PeopleAlt, Send, Undo, Visibility } from "@mui/icons-material";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { WorkforceBudgetListItem, WorkforceBudgetPermissions } from "../types/WorkforceBudget";

interface Props {
  items: WorkforceBudgetListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number; hasCriteria: boolean; permissions: WorkforceBudgetPermissions;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onClear: () => void; onAdd: () => void;
  onView: (item: WorkforceBudgetListItem) => void; onEdit: (item: WorkforceBudgetListItem) => void; onLifecycle: (item: WorkforceBudgetListItem) => void; onReject: (item: WorkforceBudgetListItem) => void;
}

const statusKeys = ["", "draft", "submitted", "approved", "rejected", "superseded", "closed"];

export default function WorkforceBudgetsCardView(props: Props) {
  const { t } = useTranslation();
  if (props.loading) return <CardViewSkeleton />;
  if (!props.items.length && !props.hasCriteria) return <EmptyState title={t("workforceBudget.empty.title")} subtitle={t("workforceBudget.empty.subtitle")} actionText={props.permissions.canCreate ? t("workforceBudget.actions.add") : undefined} onAction={props.permissions.canCreate ? props.onAdd : undefined} />;
  if (!props.items.length) return <NoResultsState message={t("workforceBudget.noResults.title")} subtitle={t("workforceBudget.noResults.subtitle")} onClearFilters={props.onClear} />;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}>
      <Grid container spacing={3}>{props.items.map((item, index) => {
        const lifecycleAction: CardActionItem = item.status === 2
          ? { key: "approve", title: t("workforceBudget.actions.approve"), color: "success", icon: <CheckCircle />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canReview }
          : { key: "submit", title: t("workforceBudget.actions.submit"), color: "primary", icon: <Send />, onClick: () => props.onLifecycle(item), disabled: !props.permissions.canSubmit };
        const actions: CardActionItem[] = [
          { key: "view", title: t("actions.view"), color: "info", icon: <Visibility />, onClick: () => props.onView(item) },
          { key: "edit", title: t("actions.edit"), color: "primary", icon: <Edit />, onClick: () => props.onEdit(item), disabled: !props.permissions.canEdit || ![1, 4].includes(item.status) },
          { ...lifecycleAction, disabled: item.status === 2 ? lifecycleAction.disabled : lifecycleAction.disabled || ![1, 4].includes(item.status) },
          { key: "reject", title: t("workforceBudget.actions.reject"), color: "error", icon: <Undo />, onClick: () => props.onReject(item), disabled: !props.permissions.canReview || item.status !== 2 },
        ];
        return <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}><EntityCard index={index} height={300} title={item.budgetCode} subtitle={`${item.currencyCode} • ${t("workforceBudget.revision.short", { revision: item.revisionNumber })}`}
          endBadge={<Stack spacing={.5} sx={{ alignItems: "flex-end" }}><Chip size="small" color={item.status === 3 ? "success" : item.status === 4 ? "error" : "info"} label={t(`workforceBudget.status.${statusKeys[item.status]}`)} />{item.isEffective ? <Chip size="small" color="success" variant="outlined" label={t("workforceBudget.effective")} /> : null}</Stack>}
          chips={<Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}><Chip size="small" variant="outlined" label={t("workforceBudget.summary.headcount", { count: item.totalAuthorizedHeadcount })} /><Chip size="small" variant="outlined" label={t("workforceBudget.summary.grandTotal", { amount: item.grandTotalBudget.toLocaleString(), currency: item.currencyCode })} /></Stack>}
          content={<Stack spacing={1.25}><Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><PeopleAlt color="primary" fontSize="small" /><Typography variant="body2">{t("workforceBudget.summary.salary", { amount: item.totalSalaryBudget.toLocaleString(), currency: item.currencyCode })}</Typography></Stack><Typography variant="body2" color="text.secondary">{t("workforceBudget.summary.recruitment", { amount: item.totalRecruitmentBudget.toLocaleString(), currency: item.currencyCode })}</Typography></Stack>}
          footer={<CardActionButtons actions={actions} />}
        /></Grid>;
      })}</Grid>
    </Box>
    <Box sx={{ flexShrink: 0, pt: 1.5 }}><CardViewPagination pinned page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount} itemsPerPageOptions={[5, 10, 25, 50]} itemsLabel={t("workforceBudget.totalLabel")} onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} /></Box>
  </Box>;
}
