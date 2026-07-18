"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { MySelect, MyTextField } from "@/shared/components/forms";
import {
  ReportViewer,
  reportApiService,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/features/reporting";
import { useTheme } from "@mui/material";

interface ReportInfo {
  Id: string;
  ReportPath: string;
  Title: string;
  Subject: string;
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
    const target = (value as { target?: { value?: unknown } }).target;
    return target?.value;
  }
  return value;
}

const CountryReportPage = () => {
  const { t } = useTranslation();

  const [reportsInfo, setReportsInfo] = useState<ReportInfo[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportInfo | null>(null);
  const reportsRequested = useRef(false);
  const theme = useTheme();

  const lang = theme.direction === "rtl" ? "ar" : "en";

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

  const fetchCountriesReports = async () => {
    try {
      const response = await reportApiService.post("report/info", {
        subFolderPath: "Countries",
        reportCategory: "Countries",
      });

      const data: unknown = await response.json();
      const reports = Array.isArray(data) ? data.filter(isReportInfo) : [];

      // Move "Countries" to the top using sort
      const sorted = [...reports].sort((a, b) =>
        a.Id === "Countries" ? -1 : b.Id === "Countries" ? 1 : 0
      );

      setReportsInfo(sorted);
      setSelectedReport((previous) => previous ?? sorted[0] ?? null);
    } catch (error) {
      console.error("Failed to fetch country reports:", error);
    }
  };

  useEffect(() => {
    if (reportsRequested.current) return;
    reportsRequested.current = true;
    void fetchCountriesReports();
  }, []);

  const handleReportChange = (value: unknown) => {
    const selected = reportsInfo.find((report) => report.Id === selectionValue(value));
    setSelectedReport(selected ?? null);
  };

  return (
    <ReportViewer reportParams={reportParams}>
      {(updateSearchParams: UpdateReportSearchParams, currentParams: ReportSearchParams) => (
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
            clearButtonAriaLabel="clear search"
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
            clearButtonAriaLabel="clear search"
          />

          <MySelect
            dataSource={reportsInfo}
            selectedItem={selectedReport?.Id || null}
            handleSelectionChange={handleReportChange}
            loading={false}
            label={t("reports.reportForms")}
            valueMember="Id"
            displayMember={lang === "ar" ? "Title" : "Subject"}
            all={false}
            showClearButton={true}
          />
        </>
      )}
    </ReportViewer>
  );
};

export default CountryReportPage;
