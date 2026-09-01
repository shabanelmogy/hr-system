"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MySelect, MyTextField } from "@/shared/components/forms";
import { ReportViewer, crystalReportService, type ReportSearchParams, type UpdateReportSearchParams } from "@/features/reporting";
import type { OrganizationalResource } from "../../types/OrganizationalStructure";

export default function OrganizationalStructureReport({ resource, showFilterBar = true }: { resource: OrganizationalResource; showFilterBar?: boolean }) {
  const { t, i18n } = useTranslation();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryKey: ["crystal-reports", "published", resource],
    queryFn: () => crystalReportService.listPublished(resource),
    staleTime: 5 * 60_000,
  });
  const reports = reportsQuery.data ?? [];
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;
  const reportOptions = reports.map((report) => ({ ...report, localizedName: (i18n.dir() === "rtl" ? report.summaryTitle : report.summarySubject) || report.displayName }));
  const renderReport = useCallback((params: ReportSearchParams, language: "ar" | "en") => {
    if (!selectedReport) throw new Error("No published organizational structure report is selected.");
    const filters = Object.fromEntries(Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([key, value]) => [key, String(value)]));
    return crystalReportService.render(selectedReport.id, { language, filters });
  }, [selectedReport]);
  if (reportsQuery.isLoading) return <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}><CircularProgress /></Box>;
  if (!selectedReport) return <Alert severity={reportsQuery.isError ? "warning" : "info"} action={<Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>{t("common.retry")}</Button>}>{reportsQuery.isError ? t("organizationalStructure.report.catalogError") : t("organizationalStructure.report.unavailable")}</Alert>;
  return <ReportViewer renderReport={renderReport} renderKey={selectedReport.id} filterBarVisible={showFilterBar}>
    {(updateSearchParams: UpdateReportSearchParams, currentParams: ReportSearchParams) => showFilterBar ? <>
      <MyTextField fieldName="NameAr" value={String(currentParams.NameAr ?? "")} label={t("organizationalStructure.fields.nameAr")} onChange={(event) => updateSearchParams({ NameAr: event.target.value })} onClear={() => updateSearchParams({ NameAr: null })} appearance="plain" margin="none" showCounter={false} clearButtonAriaLabel={t("general.clearSearch")} />
      <MyTextField fieldName="NameEn" value={String(currentParams.NameEn ?? "")} label={t("organizationalStructure.fields.nameEn")} onChange={(event) => updateSearchParams({ NameEn: event.target.value })} onClear={() => updateSearchParams({ NameEn: null })} appearance="plain" margin="none" showCounter={false} clearButtonAriaLabel={t("general.clearSearch")} />
      <MySelect dataSource={reportOptions} selectedItem={selectedReport.id} handleSelectionChange={(value) => { const id = value && typeof value === "object" && "target" in value ? (value as { target?: { value?: unknown } }).target?.value : value; setSelectedReportId(reports.find((report) => report.id === id)?.id ?? null); }} loading={reportsQuery.isFetching} label={t("reports.reportForms")} valueMember="id" displayMember="localizedName" all={false} showClearButton={false} />
    </> : null}
  </ReportViewer>;
}
