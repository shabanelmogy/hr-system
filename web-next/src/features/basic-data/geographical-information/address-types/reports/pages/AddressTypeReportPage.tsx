"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MySelect, MyTextField } from "@/shared/components/forms";
import { ReportViewer, crystalReportService, type ReportSearchParams, type UpdateReportSearchParams } from "@/features/reporting";

interface AddressTypeReportPageProps { showFilterBar?: boolean; }
function selectedValue(value: unknown): unknown { return value && typeof value === "object" && "target" in value ? (value as { target?: { value?: unknown } }).target?.value : value; }

export default function AddressTypeReportPage({ showFilterBar = true }: AddressTypeReportPageProps) {
  const { t, i18n } = useTranslation();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({ queryKey: ["crystal-reports", "published", "addresstypes"], queryFn: () => crystalReportService.listPublished("addresstypes"), staleTime: 5 * 60_000 });
  const reports = reportsQuery.data ?? [];
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;
  const options = reports.map((report) => ({ ...report, localizedName: (i18n.dir() === "rtl" ? report.summaryTitle : report.summarySubject) || report.displayName }));
  const render = useCallback((params: ReportSearchParams, language: "ar" | "en") => {
    if (!selectedReport) throw new Error("No published Address Type report is selected.");
    const filters = Object.fromEntries(Object.entries(params).filter(([, value]) => value != null && value !== "").filter(([key]) => key === "NameAr" || key === "NameEn").map(([key, value]) => [key, String(value)]));
    return crystalReportService.render(selectedReport.id, { language, filters });
  }, [selectedReport]);
  if (reportsQuery.isLoading) return <Box sx={{ display: "grid", minHeight: 240, placeItems: "center" }}><CircularProgress /></Box>;
  if (!selectedReport) return <Alert severity={reportsQuery.isError ? "warning" : "info"} action={<Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>{t("common.retry")}</Button>}>{reportsQuery.isError ? t("addressTypes.reportCatalogError") : t("addressTypes.reportUnavailable")}</Alert>;
  return <ReportViewer renderReport={render} renderKey={selectedReport.id} filterBarVisible={showFilterBar}>
    {(update: UpdateReportSearchParams, params: ReportSearchParams) => showFilterBar ? <>
      <MyTextField fieldName="NameAr" value={String(params.NameAr ?? "")} label={t("general.nameAr")} onChange={(event) => update({ NameAr: event.target.value })} onClear={() => update({ NameAr: null })} appearance="plain" margin="none" showCounter={false} clearButtonAriaLabel={t("general.clearSearch")} />
      <MyTextField fieldName="NameEn" value={String(params.NameEn ?? "")} label={t("general.nameEn")} onChange={(event) => update({ NameEn: event.target.value })} onClear={() => update({ NameEn: null })} appearance="plain" margin="none" showCounter={false} clearButtonAriaLabel={t("general.clearSearch")} />
      <MySelect dataSource={options} selectedItem={selectedReport.id} handleSelectionChange={(value) => setSelectedReportId(reports.find((report) => report.id === selectedValue(value))?.id ?? null)} loading={reportsQuery.isFetching} label={t("reports.reportForms")} valueMember="id" displayMember="localizedName" all={false} showClearButton={false} />
    </> : null}
  </ReportViewer>;
}
