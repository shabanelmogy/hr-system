"use client";

import PageHeader from "@/shared/components/navigation/header/PageHeader";
import { extractErrorMessage } from "@/shared/utils/errorUtils";
import { useFiscalYearLookup } from "@/modules/accounting";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CardViewPagination } from "@/shared/components/lists/card-view";
import { useHiringTraceByApplication, useHiringTraceByEmployee, useHiringTraceByOffer, usePlanCommitmentPage } from "../hooks/useWorkforceTraceQueries";
import type { PlanCommitmentPageQuery, PlanCommitmentRow, WorkforceTraceEdge, WorkforceTraceNode } from "../types/WorkforceTrace";

type RootKind = "application" | "offer" | "employee";

export default function WorkforceTracePage() {
  const { t, i18n } = useTranslation();
  const [root, setRoot] = useState<RootKind>("application");
  const [rootId, setRootId] = useState("");
  const [activeRoot, setActiveRoot] = useState<{ kind: RootKind; id: number } | null>(null);
  const [fiscalYearId, setFiscalYearId] = useState("");
  const [commitmentQuery, setCommitmentQuery] = useState<PlanCommitmentPageQuery | null>(null);
  const applicationTrace = useHiringTraceByApplication(activeRoot?.kind === "application" ? activeRoot.id : null);
  const offerTrace = useHiringTraceByOffer(activeRoot?.kind === "offer" ? activeRoot.id : null);
  const employeeTrace = useHiringTraceByEmployee(activeRoot?.kind === "employee" ? activeRoot.id : null);
  const trace = applicationTrace.data ?? offerTrace.data ?? employeeTrace.data;
  const traceError = applicationTrace.error ?? offerTrace.error ?? employeeTrace.error;
  const commitment = usePlanCommitmentPage(commitmentQuery ?? { fiscalYearId: 0 }, Boolean(commitmentQuery));
  const fiscalYears = useFiscalYearLookup();
  const fiscalYearOptions = useMemo(() => [...(fiscalYears.data ?? [])].sort((left, right) => {
    const openFirst = Number(right.status === 2) - Number(left.status === 2);
    return openFirst || left.code.localeCompare(right.code);
  }), [fiscalYears.data]);
  const submitRoot = () => {
    const id = Number(rootId);
    if (Number.isInteger(id) && id > 0) setActiveRoot({ kind: root, id });
  };
  const runCommitment = () => {
    const id = Number(fiscalYearId);
    if (Number.isInteger(id) && id > 0) setCommitmentQuery({ fiscalYearId: id, pageNumber: 1, pageSize: 10 });
  };

  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <PageHeader title={t("workforceTrace.title")} subTitle={t("workforceTrace.subtitle")} />
    <Card><CardContent><Stack direction={{ xs: "column", md: "row" }} spacing={1}>
      <TextField select label={t("workforceTrace.rootType")} value={root} onChange={event => setRoot(event.target.value as RootKind)}>
        <MenuItem value="application">{t("workforceTrace.application")}</MenuItem><MenuItem value="offer">{t("workforceTrace.offer")}</MenuItem><MenuItem value="employee">{t("workforceTrace.employee")}</MenuItem>
      </TextField>
      <TextField label={t("workforceTrace.rootId")} type="number" value={rootId} onChange={event => setRootId(event.target.value)} />
      <Button variant="contained" onClick={submitRoot} disabled={!Number(rootId)}>{t("workforceTrace.loadTrace")}</Button>
    </Stack></CardContent></Card>
    {traceError ? <Alert severity="error">{extractErrorMessage(traceError) || t("workforceTrace.fetchError")}</Alert> : null}
    {activeRoot && (applicationTrace.isLoading || offerTrace.isLoading || employeeTrace.isLoading) ? <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}><CircularProgress size={28} aria-label={t("common.loading")} /></Box> : null}
    {trace ? <TraceCards nodes={trace.nodes} edges={trace.edges} /> : activeRoot && !applicationTrace.isLoading && !offerTrace.isLoading && !employeeTrace.isLoading && !traceError ? <Alert severity="info">{t("workforceTrace.empty")}</Alert> : null}
    <Divider />
    <Card><CardContent><Stack spacing={1}><Typography variant="h6">{t("workforceTrace.commitmentTitle")}</Typography><Stack direction={{ xs: "column", md: "row" }} spacing={1}><TextField select label={t("workforceTrace.fiscalYear")} value={fiscalYearId} onChange={event => setFiscalYearId(event.target.value)} disabled={fiscalYears.isLoading || fiscalYearOptions.length === 0} sx={{ minWidth: 260 }}><MenuItem value="">{t("workforceTrace.selectFiscalYear")}</MenuItem>{fiscalYearOptions.map(year => <MenuItem key={year.id} value={year.id}>{year.code} Ã¢â‚¬â€ {i18n.language.startsWith("ar") ? year.nameAr : year.nameEn}</MenuItem>)}</TextField><Button variant="outlined" onClick={runCommitment} disabled={!Number(fiscalYearId)}>{t("workforceTrace.loadCommitment")}</Button></Stack></Stack></CardContent></Card>
    {commitment.error ? <Alert severity="error">{extractErrorMessage(commitment.error) || t("workforceTrace.fetchError")}</Alert> : null}
    {commitment.data ? <CommitmentTable rows={commitment.data.items} metadata={commitment.data.metaData} onPageChange={page => setCommitmentQuery(previous => previous ? { ...previous, pageNumber: page + 1 } : previous)} onPageSizeChange={pageSize => setCommitmentQuery(previous => previous ? { ...previous, pageNumber: 1, pageSize } : previous)} /> : null}
  </Box>;
}

function TraceCards({ nodes, edges }: { nodes: WorkforceTraceNode[]; edges: WorkforceTraceEdge[] }) {
  const { t } = useTranslation();
  const nodeByKey = useMemo(() => new Map(nodes.map(node => [node.key, node])), [nodes]);
  return <Stack spacing={1}>
    <Stack component="ol" spacing={1} sx={{ p: 0, m: 0, listStyle: "none" }} aria-label={t("workforceTrace.timelineAriaLabel")}>
    {nodes.map((node, index) => <motion.li key={node.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <Card variant="outlined"><CardContent sx={{ display: "flex", gap: 1, alignItems: "center" }}><Chip label={node.kind} size="small" color="primary" variant="outlined" /><Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700 }}>{node.title}</Typography><Typography variant="body2" color="text.secondary">{node.status ?? t("workforceTrace.noStatus")}{node.occurredOn ? ` Ã¢â‚¬Â¢ ${new Date(node.occurredOn).toLocaleString()}` : ""}</Typography></Box>{node.fiscalCost !== null && node.fiscalCost !== undefined ? <Typography variant="body2">{node.fiscalCost} {node.currencyCode ?? ""}</Typography> : null}</CardContent></Card>
    </motion.li>)}
    </Stack>
    <Card variant="outlined"><CardContent><Typography variant="subtitle2">{t("workforceTrace.relationships")}</Typography>{edges.length === 0 ? <Typography variant="body2" color="text.secondary">{t("workforceTrace.noRelationships")}</Typography> : <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2 }}>{edges.map(edge => <li key={`${edge.fromKey}-${edge.toKey}-${edge.relation}`}><Typography variant="body2">{nodeByKey.get(edge.fromKey)?.title ?? edge.fromKey} Ã¢â‚¬â€ {edge.relation} Ã¢â€ â€™ {nodeByKey.get(edge.toKey)?.title ?? edge.toKey}</Typography></li>)}</Stack>}</CardContent></Card>
  </Stack>;
}

function CommitmentTable({ rows, metadata, onPageChange, onPageSizeChange }: { rows: PlanCommitmentRow[]; metadata: { currentPage: number; pageSize: number; totalCount: number }; onPageChange: (page: number) => void; onPageSizeChange: (pageSize: number) => void }) {
  const { t } = useTranslation();
  return <Stack spacing={1}>{rows.map(row => <Card key={row.positionEnvelopeId} variant="outlined"><CardContent><Typography sx={{ fontWeight: 700 }}>{row.envelopeCode} Ã¢â‚¬Â¢ {row.planCode} Ã¢â‚¬Â¢ {row.budgetCode}</Typography><Typography variant="body2">{t("workforceTrace.headcountSummary", { available: row.availableHeadcount, authorized: row.authorizedHeadcount })} Ã¢â‚¬Â¢ {t("workforceTrace.countSummary", { staffingRequests: row.staffingRequests, requisitions: row.requisitions, offers: row.offers, hires: row.hires })}</Typography>{row.availableSalaryCost !== null && row.availableSalaryCost !== undefined ? <Typography variant="body2" color="text.secondary">{t("workforceTrace.salarySummary", { amount: row.availableSalaryCost, currency: row.currencyCode ?? "" })}</Typography> : null}</CardContent></Card>)}<CardViewPagination page={metadata.currentPage - 1} rowsPerPage={metadata.pageSize} totalItems={metadata.totalCount} itemsPerPageOptions={[5, 10, 25]} itemsLabel={t("workforceTrace.commitmentRows")} onPageChange={onPageChange} onRowsPerPageChange={onPageSizeChange} /></Stack>;
}
