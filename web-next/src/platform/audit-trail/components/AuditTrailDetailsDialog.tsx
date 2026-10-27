"use client";
import { useMemo } from "react";
import { Box, Button } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import type { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import { MyForm, FormSection } from "@/shared/components/forms";
import { MyDataGrid } from "@/shared/components/data-grid";
import { DetailFields } from "@/shared/components/data-display";
import { FeedbackState } from "@/shared/components/feedback";
import { useAuditTrailEntry } from "../hooks/useAuditTrail";
import type { AuditTrailItem, AuditFieldChange } from "../types/auditTrail";
import { entityLabel, fieldLabel, formatAuditDate, moduleLabel } from "./auditTrailFormat";
export function AuditTrailDetailsDialog({ item, onClose }: { item: AuditTrailItem | null; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const query = useAuditTrailEntry(item?.moduleCode ?? null, item?.id ?? null);
  const changes = useMemo(() => (query.data?.changes ?? []).map((change, index) => ({ ...change, id: index })), [query.data]);
  const columns = useMemo<GridColDef<AuditFieldChange & { id: number }>[]>(() => [
    { field: "field", headerName: t("auditLog.field"), minWidth: 180, flex: 1, valueFormatter: value => fieldLabel(t, String(value)) },
    { field: "oldValue", headerName: t("auditLog.oldValue"), minWidth: 180, flex: 1, valueFormatter: value => value ?? t("auditLog.empty") },
    { field: "newValue", headerName: t("auditLog.newValue"), minWidth: 180, flex: 1, valueFormatter: value => value ?? t("auditLog.empty") },
  ], [t]);
  return <MyForm open={Boolean(item)} onClose={onClose} title={item ? entityLabel(t, item.entityName) : t("auditLog.title")} subtitle={item?.entityDisplay ?? item?.entityKey} icon={<HistoryIcon />} isViewMode maxWidth="lg">
    {item ? <FormSection title={t("auditLog.record")} variant="outlined"><DetailFields items={[
      { id: "module", label: t("auditLog.module"), value: moduleLabel(t, item.moduleCode) },
      { id: "key", label: t("auditLog.recordKey"), value: item.entityKey },
      { id: "user", label: t("auditLog.user"), value: item.userName ?? item.userId ?? t("auditLog.system") },
      { id: "when", label: t("auditLog.when"), value: formatAuditDate(item.occurredOn, i18n.language) },
    ]} /></FormSection> : null}
    <Box sx={{ height: 340, mt: 2, minWidth: 0 }}><MyDataGrid rows={query.isError ? [] : changes} columns={columns} loading={query.isPending}
      showToolbar pagination pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
      emptyContent={<FeedbackState icon={<HistoryIcon />} role={query.isError ? "alert" : "status"} title={t(query.isError ? "auditLog.loadError" : "auditLog.noFieldChanges")} actions={query.isError ? <Button onClick={() => void query.refetch()}>{t("auditLog.retry")}</Button> : undefined} />} /></Box>
  </MyForm>;
}
