"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { MySelect, TextFieldWithClear } from "@/shared/components/common/form-controls";
import { ReportViewer, reportApiService } from "@/features/reporting";
import { useTheme } from "@mui/material";

const CountryReportPage = () => {
  const { t } = useTranslation();

  const [reportsInfo, setReportsInfo] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
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

  useEffect(() => {
    if (reportsRequested.current) return;
    reportsRequested.current = true;
    void fetchCountriesReports();
  }, []);

  const fetchCountriesReports = async () => {
    try {
      const response = await reportApiService.post("report/info", {
        subFolderPath: "Countries",
        reportCategory: "Countries",
      });

      const data = await response.json();

      // Move "Countries" to the top using sort
      const sorted = data.sort((a: any, b: any) =>
        a.Id === "Countries" ? -1 : b.Id === "Countries" ? 1 : 0
      );

      setReportsInfo(sorted);
      setSelectedReport((prev: any) => prev ?? sorted[0]);
    } catch (error) {
      console.error("Failed to fetch country reports:", error);
    }
  };

  const handleReportChange = (e: any) => {
    const selected = reportsInfo.find((r: any) => r.Id === (e?.target?.value ?? e));
    setSelectedReport(selected ?? null);
  };

  return (
    <ReportViewer reportParams={reportParams}>
      {(updateSearchParams: any, currentParams: any) => (
        <>
          <TextFieldWithClear
            searchText={currentParams.CountryAr || ""}
            label={t("countries.arabicName")}
            handleSearch={(e: any) =>
              updateSearchParams({ CountryAr: e.target.value })
            }
            handleClearSearch={() => updateSearchParams({ CountryAr: null })}
          />

          <TextFieldWithClear
            searchText={currentParams.CountryEn || ""}
            label={t("countries.englishName")}
            handleSearch={(e: any) =>
              updateSearchParams({ CountryEn: e.target.value })
            }
            handleClearSearch={() => updateSearchParams({ CountryEn: null })}
          />

          <MySelect
            dataSource={reportsInfo}
            selectedItem={selectedReport?.Id || null}
            handleSelectionChange={handleReportChange}
            loading={false}
            label={t("reports.reportForms")}
            displayValue="Id"
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
