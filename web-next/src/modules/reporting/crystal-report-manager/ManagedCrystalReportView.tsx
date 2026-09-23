"use client";

import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MySelect, MyTextField } from "@/shared/components/forms";
import {
  ReportViewer,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/shared/reporting";
import { crystalReportService } from "./services";

export interface ManagedCrystalReportFilter {
  key: string;
  label: string;
}

export interface ManagedCrystalReportViewProps {
  entityKey: string;
  scope?: "tenant" | "global";
  catalogErrorMessage: string;
  unavailableMessage: string;
  filters: readonly ManagedCrystalReportFilter[];
  showFilterBar?: boolean;
}

function selectedValue(value: unknown): unknown {
  return value && typeof value === "object" && "target" in value
    ? (value as { target?: { value?: unknown } }).target?.value
    : value;
}

/**
 * Shared UI and lifecycle for an entity-backed managed Crystal Report view.
 * Feature modules own only the entity key, approved filters, and translated copy.
 */
export default function ManagedCrystalReportView({
  entityKey,
  scope = "tenant",
  catalogErrorMessage,
  unavailableMessage,
  filters,
  showFilterBar = true,
}: ManagedCrystalReportViewProps) {
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryKey: ["crystal-reports", scope, entityKey],
    queryFn: () => scope === "global"
      ? crystalReportService.listGlobal(entityKey)
      : crystalReportService.listPublished(entityKey),
    staleTime: 5 * 60_000,
  });
  const reports = reportsQuery.data ?? [];
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;
  const reportOptions = useMemo(
    () => reports.map((report) => ({
      ...report,
      localizedName:
        (direction === "rtl" ? report.summaryTitle : report.summarySubject) || report.displayName,
    })),
    [direction, reports],
  );
  const approvedFilterKeys = useMemo(() => new Set(filters.map((filter) => filter.key)), [filters]);

  const render = useCallback((params: ReportSearchParams, language: "ar" | "en") => {
    if (!selectedReport) {
      throw new Error(`No published ${entityKey} report is selected.`);
    }

    const approvedFilters = Object.fromEntries(
      Object.entries(params)
        .filter(([key, value]) => approvedFilterKeys.has(key) && value != null && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );

    const request = { language, filters: approvedFilters };
    return scope === "global"
      ? crystalReportService.renderGlobal(selectedReport, request)
      : crystalReportService.render(selectedReport.id, request);
  }, [approvedFilterKeys, entityKey, scope, selectedReport]);

  if (reportsQuery.isLoading) {
    return (
      <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedReport) {
    return (
      <Alert
        severity={reportsQuery.isError ? "warning" : "info"}
        action={
          <Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>
            {t("common.retry")}
          </Button>
        }
      >
        {reportsQuery.isError ? catalogErrorMessage : unavailableMessage}
      </Alert>
    );
  }

  return (
    <ReportViewer
      renderReport={render}
      renderKey={selectedReport.id}
      filterBarVisible={showFilterBar}
    >
      {(update: UpdateReportSearchParams, params: ReportSearchParams) => showFilterBar ? (
        <>
          {filters.map((filter) => (
            <MyTextField
              key={filter.key}
              fieldName={filter.key}
              value={String(params[filter.key] ?? "")}
              label={filter.label}
              onChange={(event) => update({ [filter.key]: event.target.value })}
              onClear={() => update({ [filter.key]: null })}
              appearance="plain"
              margin="none"
              showCounter={false}
              clearButtonAriaLabel={t("general.clearSearch")}
            />
          ))}
          <MySelect
            dataSource={reportOptions}
            selectedItem={selectedReport.id}
            handleSelectionChange={(value) => {
              const nextId = selectedValue(value);
              setSelectedReportId(reports.find((report) => report.id === nextId)?.id ?? null);
            }}
            loading={reportsQuery.isFetching}
            label={t("reports.reportForms")}
            valueMember="id"
            displayMember="localizedName"
            all={false}
            showClearButton={false}
          />
        </>
      ) : null}
    </ReportViewer>
  );
}
