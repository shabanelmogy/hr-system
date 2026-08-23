"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { MySelect, MyTextField } from "@/shared/components/forms";
import {
  ReportViewer,
  crystalReportService,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/features/reporting";

interface StateReportPageProps {
  /** Controlled by the shared multi-view header filter toggle. */
  showFilterBar?: boolean;
}

function selectionValue(value: unknown): unknown {
  if (value && typeof value === "object" && "target" in value) {
    return (value as { target?: { value?: unknown } }).target?.value;
  }
  return value;
}

export default function StateReportPage({ showFilterBar = true }: StateReportPageProps) {
  const { t, i18n } = useTranslation();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const reportsQuery = useQuery({
    queryKey: ["crystal-reports", "published", "states"],
    queryFn: () => crystalReportService.listPublished("states"),
    staleTime: 5 * 60_000,
  });
  const reports = reportsQuery.data ?? [];
  const reportOptions = reports.map((report) => ({
    ...report,
    localizedName: (i18n.dir() === "rtl" ? report.summaryTitle : report.summarySubject)
      || report.displayName,
  }));
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  const handleReportChange = (value: unknown) => {
    const selected = reports.find((report) => report.id === selectionValue(value));
    setSelectedReportId(selected?.id ?? null);
  };

  const renderCrystalReport = useCallback((params: ReportSearchParams, language: "ar" | "en") => {
    if (!selectedReport) throw new Error("No published Crystal report is selected.");
    const filters = Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== null && value !== undefined && value !== "")
        .map(([key, value]) => [key, String(value)]),
    );
    return crystalReportService.render(selectedReport.id, { language, filters });
  }, [selectedReport]);

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
        action={(
          <Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>
            {t("common.retry")}
          </Button>
        )}
      >
        {reportsQuery.isError ? t("states.reportCatalogError") : t("states.reportUnavailable")}
      </Alert>
    );
  }

  return (
    <ReportViewer
      renderReport={renderCrystalReport}
      renderKey={selectedReport.id}
      filterBarVisible={showFilterBar}
    >
      {(updateSearchParams: UpdateReportSearchParams, currentParams: ReportSearchParams) => (
        <>
          {showFilterBar ? (
            <>
              <MyTextField
                fieldName="NameAr"
                value={String(currentParams.NameAr ?? "")}
                label={t("general.nameAr")}
                onChange={(event) => updateSearchParams({ NameAr: event.target.value })}
                onClear={() => updateSearchParams({ NameAr: null })}
                appearance="plain"
                margin="none"
                showCounter={false}
                clearButtonAriaLabel={t("general.clearSearch")}
              />
              <MyTextField
                fieldName="NameEn"
                value={String(currentParams.NameEn ?? "")}
                label={t("general.nameEn")}
                onChange={(event) => updateSearchParams({ NameEn: event.target.value })}
                onClear={() => updateSearchParams({ NameEn: null })}
                appearance="plain"
                margin="none"
                showCounter={false}
                clearButtonAriaLabel={t("general.clearSearch")}
              />
              <MySelect
                dataSource={reportOptions}
                selectedItem={selectedReport.id}
                handleSelectionChange={handleReportChange}
                loading={reportsQuery.isFetching}
                label={t("reports.reportForms")}
                valueMember="id"
                displayMember="localizedName"
                all={false}
                showClearButton={false}
              />
            </>
          ) : null}
        </>
      )}
    </ReportViewer>
  );
}
