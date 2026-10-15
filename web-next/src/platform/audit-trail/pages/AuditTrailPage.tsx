"use client";

import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { ContentWrapper } from "@/shared/components/layout";
import { PageHeader } from "@/shared/components/navigation/header";
import { AuditTrailDetailsDialog } from "../components/AuditTrailDetailsDialog";
import { AuditTrailTable } from "../components/AuditTrailTable";
import { actionLabel, entityLabel, moduleLabel } from "../components/auditTrailFormat";
import { useAuditTrailFilters, useAuditTrailList } from "../hooks/useAuditTrail";
import {
  auditActions,
  type AuditAction,
  type AuditTrailItem,
  type AuditTrailQuery,
} from "../types/auditTrail";

interface FilterState {
  moduleCode: string;
  entityName: string;
  entityKey: string;
  action: AuditAction | "";
  from: string;
  to: string;
}

const emptyFilters: FilterState = { moduleCode: "", entityName: "", entityKey: "", action: "", from: "", to: "" };

/** Every create, change, delete and restore in the system, newest first. */
export default function AuditTrailPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selected, setSelected] = useState<AuditTrailItem | null>(null);
  const filterOptions = useAuditTrailFilters();
  const modules = filterOptions.data ?? [];
  const entityNames = useMemo(() => {
    const source = filters.moduleCode
      ? modules.filter((module) => module.moduleCode === filters.moduleCode)
      : modules;
    return [...new Set(source.flatMap((module) => module.entityNames))].sort();
  }, [modules, filters.moduleCode]);

  const query = useMemo<AuditTrailQuery>(() => ({
    moduleCode: filters.moduleCode || undefined,
    entityName: filters.entityName || undefined,
    entityKey: filters.entityKey.trim() || undefined,
    action: filters.action || undefined,
    fromUtc: filters.from ? new Date(`${filters.from}T00:00:00`).toISOString() : undefined,
    toUtc: filters.to ? new Date(`${filters.to}T23:59:59.999`).toISOString() : undefined,
    pageSize: 50,
  }), [filters]);
  const list = useAuditTrailList(query);
  const items = list.data?.pages.flatMap((page) => page.items) ?? [];
  const update = (patch: Partial<FilterState>) => setFilters((current) => ({ ...current, ...patch }));

  return (
    <ContentWrapper>
      <PageHeader title={t("auditLog.title")} subTitle={t("auditLog.subTitle")} />

      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(6, 1fr)" },
          mb: 2,
        }}
      >
        <TextField
          select
          size="small"
          label={t("auditLog.module")}
          value={filters.moduleCode}
          onChange={(event) => update({ moduleCode: event.target.value, entityName: "" })}
        >
          <MenuItem value="">{t("auditLog.all")}</MenuItem>
          {modules.map((module) => (
            <MenuItem key={module.moduleCode} value={module.moduleCode}>
              {moduleLabel(t, module.moduleCode)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label={t("auditLog.recordType")}
          value={filters.entityName}
          onChange={(event) => update({ entityName: event.target.value })}
        >
          <MenuItem value="">{t("auditLog.all")}</MenuItem>
          {entityNames.map((name) => (
            <MenuItem key={name} value={name}>{entityLabel(t, name)}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label={t("auditLog.recordKey")}
          value={filters.entityKey}
          onChange={(event) => update({ entityKey: event.target.value })}
        />
        <TextField
          select
          size="small"
          label={t("auditLog.action")}
          value={filters.action}
          onChange={(event) => update({ action: event.target.value as AuditAction | "" })}
        >
          <MenuItem value="">{t("auditLog.all")}</MenuItem>
          {auditActions.map((action) => (
            <MenuItem key={action} value={action}>{actionLabel(t, action)}</MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          type="date"
          label={t("auditLog.from")}
          value={filters.from}
          onChange={(event) => update({ from: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label={t("auditLog.to")}
          value={filters.to}
          onChange={(event) => update({ to: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>

      {list.isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress aria-label={t("auditLog.loading")} />
        </Box>
      ) : list.error ? (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={() => void list.refetch()}>{t("auditLog.retry")}</Button>}
        >
          {t("auditLog.loadError")}
        </Alert>
      ) : items.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
          {t("auditLog.noEntries")}
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 1.5, minWidth: 0 }}>
          <AuditTrailTable items={items} onSelect={setSelected} />
          {list.hasNextPage ? (
            <Button
              variant="outlined"
              disabled={list.isFetchingNextPage}
              onClick={() => void list.fetchNextPage()}
              sx={{ justifySelf: "center" }}
            >
              {t("auditLog.loadMore")}
            </Button>
          ) : null}
        </Box>
      )}

      <AuditTrailDetailsDialog item={selected} onClose={() => setSelected(null)} />
    </ContentWrapper>
  );
}
