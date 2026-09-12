"use client";

import { MyForm } from "@/shared/components/forms";
import { Alert, Box, Button, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { PositionEnvelopeDetail } from "../types/WorkforceBudget";

interface Props {
  open: boolean;
  item?: PositionEnvelopeDetail | null;
  loading?: boolean;
  detailError?: string | null;
  onRetryDetail?: () => void;
  onClose: () => void;
}

function CapacityRow({ label, available, total, currency }: { label: string; available: number; total: number; currency?: string }) {
  const { t } = useTranslation();
  const used = total - available;
  const ratio = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const format = (value: number) => currency ? t("envelopes.capacity.money", { amount: value.toLocaleString(), currency }) : `${value}`;
  return <Stack spacing={.5}>
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{label}</Typography>
      <Typography variant="body2">{t("envelopes.capacity.used", { used: format(used), total: format(total) })}</Typography>
    </Stack>
    <LinearProgress variant="determinate" value={ratio} aria-label={label} />
    <Typography variant="caption" color="text.secondary">{t("envelopes.capacity.available", { amount: format(available) })}</Typography>
  </Stack>;
}

export default function PositionEnvelopeDetails({ open, item, loading = false, detailError, onRetryDetail, onClose }: Props) {
  const { t } = useTranslation();
  return <MyForm
    open={open}
    onClose={onClose}
    title={t("envelopes.details.title")}
    subtitle={item ? `${item.envelopeCode} • ${item.currencyCode}` : t("envelopes.details.subtitle")}
    hideFooter
    isViewMode
    recordId={item?.id}
    maxWidth="md"
    maxHeight="86vh"
  >
    {loading ? <LinearProgress /> : null}
    {detailError ? <Alert severity="error" action={onRetryDetail ? <Button color="inherit" onClick={onRetryDetail}>{t("common.retry")}</Button> : undefined}>{detailError}</Alert> : null}
    {!item && !detailError ? <Alert severity="info">{t("envelopes.details.loading")}</Alert> : null}
    {item ? <Stack spacing={2}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        <Chip size="small" color="info" label={t("envelopes.lineage.budget", { id: item.workforceBudgetId })} />
        <Chip size="small" variant="outlined" label={t("envelopes.lineage.plan", { id: item.workforcePlanId })} />
        <Chip size="small" variant="outlined" label={t("envelopes.lineage.year", { id: item.fiscalYearId })} />
        <Chip size="small" variant="outlined" label={t("envelopes.lineage.policy", { version: item.calculationPolicyVersion })} />
      </Stack>
      <Divider />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("envelopes.details.capacity")}</Typography>
        <Stack spacing={2}>
          <CapacityRow label={t("envelopes.fields.headcountCapacity")} available={item.availableHeadcount} total={item.authorizedHeadcount} />
          <CapacityRow label={t("envelopes.fields.salaryCapacity")} available={item.availableSalaryBudget} total={item.authorizedSalaryBudget} currency={item.currencyCode} />
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>{t("envelopes.details.snapshots")}</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip size="small" variant="outlined" label={t("envelopes.fields.position", { id: item.positionId })} />
          {item.branchId ? <Chip size="small" variant="outlined" label={t("envelopes.fields.branch", { id: item.branchId })} /> : <Chip size="small" variant="outlined" label={t("envelopes.companyWide")} />}
          <Chip size="small" variant="outlined" label={t("envelopes.fields.department", { id: item.departmentId })} />
          <Chip size="small" variant="outlined" label={t("envelopes.fields.division", { id: item.divisionId })} />
        </Stack>
      </Box>
    </Stack> : null}
  </MyForm>;
}
