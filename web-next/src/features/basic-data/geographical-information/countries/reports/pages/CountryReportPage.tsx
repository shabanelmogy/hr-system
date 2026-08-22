"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { MySelect, MyTextField } from "@/shared/components/forms";
import {
  ReportViewer,
  reportApiService,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/features/reporting";
import { Alert, Box, Button, ToggleButton, ToggleButtonGroup, useTheme } from "@mui/material";
import CountryActiveReportsDesigner from "../components/CountryActiveReportsDesigner";

interface ReportInfo {
  Id: string;
  ReportPath: string;
  Title: string;
  Subject: string;
}

interface CountryReportPageProps {
  /** Controlled by the shared multi-view header filter toggle. */
  showFilterBar?: boolean;
}

type CountryReportMode = "crystal" | "designer";

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
    const target = (value as { target?: { value?: unknown } }).target;
    return target?.value;
  }
  return value;
}

async function getCountryReportCatalog(): Promise<ReportInfo[]> {
  const response = await reportApiService.post("report/info", {
    subFolderPath: "Countries",
    reportCategory: "Countries",
  });
  const data: unknown = await response.json();
  const reports = Array.isArray(data) ? data.filter(isReportInfo) : [];

  return [...reports].sort((a, b) =>
    a.Id === "Countries" ? -1 : b.Id === "Countries" ? 1 : 0
  );
}

const CountryReportPage = ({ showFilterBar = true }: CountryReportPageProps) => {
  const { t } = useTranslation();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportMode, setReportMode] = useState<CountryReportMode>("crystal");
  const theme = useTheme();

  const lang = theme.direction === "rtl" ? "ar" : "en";
  const reportsQuery = useQuery({
    queryKey: ["country-reports", "catalog", lang],
    queryFn: getCountryReportCatalog,
    enabled: reportMode === "crystal",
    staleTime: 5 * 60_000,
  });
  const reportsInfo = reportsQuery.data ?? [];
  const selectedReport = reportsInfo.find((report) => report.Id === selectedReportId)
    ?? reportsInfo[0]
    ?? null;

  const defaultReportParams = {
    LogoName: "Logo1.jpg",
    ExportFilename: "Countries",
  };

  const reportParams = selectedReport
    ? {
      ...defaultReportParams,
      ReportPath: selectedReport.ReportPath,
      ReportFileName: selectedReport.Id,
    }
    : {
      ...defaultReportParams,
      ReportPath: "Reports/Countries",
      ReportFileName: "Countries",
    };

  const handleReportChange = (value: unknown) => {
    const selected = reportsInfo.find((report) => report.Id === selectionValue(value));
    setSelectedReportId(selected?.Id ?? null);
  };

  const handleReportModeChange = (_event: React.MouseEvent<HTMLElement>, value: CountryReportMode | null) => {
    if (value) setReportMode(value);
  };

  return (
    <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
      <Box sx={{ px: { xs: 1, sm: 1.5 }, pt: { xs: 1, sm: 1.5 } }}>
        <ToggleButtonGroup
          aria-label={t("countries.activeReports.reportModeAriaLabel")}
          color="primary"
          exclusive
          onChange={handleReportModeChange}
          size="small"
          value={reportMode}
        >
          <ToggleButton value="crystal">
            {t("countries.activeReports.crystalMode")}
          </ToggleButton>
          <ToggleButton value="designer">
            {t("countries.activeReports.designerMode")}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {reportMode === "designer" ? (
        <CountryActiveReportsDesigner />
      ) : (
        <ReportViewer reportParams={reportParams} filterBarVisible={showFilterBar}>
          {(updateSearchParams: UpdateReportSearchParams, currentParams: ReportSearchParams) => (
            <>
              {reportsQuery.isError ? (
                <Alert
                  severity="warning"
                  action={(
                    <Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>
                      {t("common.retry")}
                    </Button>
                  )}
                >
                  {t("countries.reportCatalogError")}
                </Alert>
              ) : null}

              {showFilterBar ? (
                <>
                  <MyTextField
                    fieldName="CountryAr"
                    value={String(currentParams.CountryAr ?? "")}
                    label={t("countries.arabicName")}
                    onChange={(event) =>
                      updateSearchParams({ CountryAr: event.target.value })
                    }
                    onClear={() => updateSearchParams({ CountryAr: null })}
                    appearance="plain"
                    margin="none"
                    showCounter={false}
                    clearButtonAriaLabel={t("general.clearSearch")}
                  />

                  <MyTextField
                    fieldName="CountryEn"
                    value={String(currentParams.CountryEn ?? "")}
                    label={t("countries.englishName")}
                    onChange={(event) =>
                      updateSearchParams({ CountryEn: event.target.value })
                    }
                    onClear={() => updateSearchParams({ CountryEn: null })}
                    appearance="plain"
                    margin="none"
                    showCounter={false}
                    clearButtonAriaLabel={t("general.clearSearch")}
                  />

                  <MySelect
                    dataSource={reportsInfo}
                    selectedItem={selectedReport?.Id || null}
                    handleSelectionChange={handleReportChange}
                    loading={reportsQuery.isLoading || reportsQuery.isFetching}
                    label={t("reports.reportForms")}
                    valueMember="Id"
                    displayMember={lang === "ar" ? "Title" : "Subject"}
                    all={false}
                    showClearButton={true}
                  />
                </>
              ) : null}
            </>
          )}
        </ReportViewer>
      )}
    </Box>
  );
};

export default CountryReportPage;
