"use client";

import { useQuery } from "@tanstack/react-query";
import { Alert, Box, Button, CircularProgress, useTheme } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MySelect, MyTextField } from "@/shared/components/forms";
import {
  ReportViewer,
  reportApiService,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/features/reporting";

interface ReportInfo {
  Id: string;
  ReportPath: string;
  Title: string;
  Subject: string;
}

interface StateReportPageProps {
  /** Controlled by the shared multi-view header filter toggle. */
  showFilterBar?: boolean;
}

function isReportInfo(value: unknown): value is ReportInfo {
  if (!value || typeof value !== "object") return false;
  const report = value as Record<string, unknown>;
  return (
    typeof report.Id === "string" &&
    typeof report.ReportPath === "string" &&
    typeof report.Title === "string" &&
    typeof report.Subject === "string"
  );
}

function selectionValue(value: unknown): unknown {
  if (value && typeof value === "object" && "target" in value) {
    return (value as { target?: { value?: unknown } }).target?.value;
  }
  return value;
}

async function getStateReportCatalog(): Promise<ReportInfo[]> {
  const response = await reportApiService.post("report/info", {
    subFolderPath: "States",
    reportCategory: "States",
  });
  const data: unknown = await response.json();
  return Array.isArray(data) ? data.filter(isReportInfo) : [];
}

export default function StateReportPage({ showFilterBar = true }: StateReportPageProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const lang = theme.direction === "rtl" ? "ar" : "en";
  const reportsQuery = useQuery({
    queryKey: ["state-reports", "catalog", lang],
    queryFn: getStateReportCatalog,
    staleTime: 5 * 60_000,
  });
  const reports = reportsQuery.data ?? [];
  const selectedReport = reports.find((report) => report.Id === selectedReportId) ?? reports[0] ?? null;

  const handleReportChange = (value: unknown) => {
    const selected = reports.find((report) => report.Id === selectionValue(value));
    setSelectedReportId(selected?.Id ?? null);
  };

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

  const reportParams = {
    LogoName: "Logo1.jpg",
    ExportFilename: "States",
    ReportPath: selectedReport.ReportPath,
    ReportFileName: selectedReport.Id,
  };

  return (
    <ReportViewer
      reportParams={reportParams}
      filterBarVisible={showFilterBar}
      generateEndpoint="report/states/generate"
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
                dataSource={reports}
                selectedItem={selectedReport.Id}
                handleSelectionChange={handleReportChange}
                loading={reportsQuery.isFetching}
                label={t("reports.reportForms")}
                valueMember="Id"
                displayMember={lang === "ar" ? "Title" : "Subject"}
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
