import { CardActionButtons, EntityCard, type CardActionItem } from "@/shared/components/cards";
import { EmptyState, NoResultsState } from "@/shared/components/feedback/states";
import { CardViewPagination, CardViewSkeleton } from "@/shared/components/lists/card-view";
import { Visibility } from "@mui/icons-material";
import { Box, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PositionEnvelopeListItem } from "../types/WorkforceBudget";

interface Props {
  items: PositionEnvelopeListItem[]; loading: boolean; page: number; pageSize: number; totalCount: number; hasCriteria: boolean;
  onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onClear: () => void;
  onView: (item: PositionEnvelopeListItem) => void;
}

export default function PositionEnvelopesCardView(props: Props) {
  const { t } = useTranslation();
  if (props.loading) return <CardViewSkeleton />;
  if (!props.items.length && !props.hasCriteria) return <EmptyState title={t("envelopes.empty.title")} subtitle={t("envelopes.empty.subtitle")} />;
  if (!props.items.length) return <NoResultsState message={t("envelopes.noResults.title")} subtitle={t("envelopes.noResults.subtitle")} onClearFilters={props.onClear} />;
  return <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden", p: { xs: 1, md: 1.5 }, scrollbarGutter: "stable" }}>
      <Grid container spacing={3}>{props.items.map((item, index) => {
        const usedHeadcount = item.authorizedHeadcount - item.availableHeadcount;
        const headcountRatio = item.authorizedHeadcount > 0 ? Math.min(100, Math.round((usedHeadcount / item.authorizedHeadcount) * 100)) : 0;
        const actions: CardActionItem[] = [
          { key: "view", title: t("actions.view"), color: "info", icon: <Visibility />, onClick: () => props.onView(item) },
        ];
        return <Grid key={item.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}><EntityCard index={index} height={300} title={item.envelopeCode} subtitle={item.currencyCode}
          endBadge={<Chip size="small" color="info" label={t("envelopes.capacity.headcount", { available: item.availableHeadcount, total: item.authorizedHeadcount })} />}
          chips={<Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}><Chip size="small" variant="outlined" label={t("envelopes.capacity.reserved", { count: item.reservedHeadcount })} /><Chip size="small" variant="outlined" label={t("envelopes.capacity.hired", { count: item.hiredHeadcount })} /></Stack>}
          content={<Stack spacing={1.25}><LinearProgress variant="determinate" value={headcountRatio} aria-label={t("envelopes.capacity.headcount", { available: item.availableHeadcount, total: item.authorizedHeadcount })} /><Typography variant="body2" color="text.secondary">{t("envelopes.capacity.salary", { available: item.availableSalaryBudget.toLocaleString(), total: item.authorizedSalaryBudget.toLocaleString(), currency: item.currencyCode })}</Typography></Stack>}
          footer={<CardActionButtons actions={actions} />}
        /></Grid>;
      })}</Grid>
    </Box>
    <Box sx={{ flexShrink: 0, pt: 1.5 }}><CardViewPagination pinned page={props.page} rowsPerPage={props.pageSize} totalItems={props.totalCount} itemsPerPageOptions={[5, 10, 25, 50]} itemsLabel={t("envelopes.totalLabel")} onPageChange={props.onPageChange} onRowsPerPageChange={props.onPageSizeChange} /></Box>
  </Box>;
}
