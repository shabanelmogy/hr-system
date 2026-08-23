"use client";

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { MySelect, MyTextField } from "@/shared/components/forms";
import { usePermissions } from "@/shared/hooks/usePermissions";
import {
  ReportViewer,
  ServerReportViewer,
  crystalReportService,
  type ReportSearchParams,
  type UpdateReportSearchParams,
} from "@/features/reporting";
import { Alert, Box, Button, CircularProgress, ToggleButton, ToggleButtonGroup } from "@mui/material";
import CountryActiveReportsDesigner from "../components/CountryActiveReportsDesigner";

interface CountryReportPageProps {
  /** Controlled by the shared multi-view header filter toggle. */
  showFilterBar?: boolean;
}

type CountryReportMode = "crystal" | "activeReports" | "designer";

function selectionValue(value: unknown): unknown {
  if (value && typeof value === "object" && "target" in value) {
    const target = (value as { target?: { value?: unknown } }).target;
    return target?.value;
  }
  return value;
}

const CountryReportPage = ({ showFilterBar = true }: CountryReportPageProps) => {
  const { t, i18n } = useTranslation();
  const { hasPermission, isReadOnly } = usePermissions();

  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [reportMode, setReportMode] = useState<CountryReportMode>("crystal");
  const canManageTemplates = !isReadOnly &&
    hasPermission("ReportTemplates:View") &&
    hasPermission("ReportTemplates:Edit");
  const canViewTemplates = hasPermission("ReportTemplates:View");

  const reportsQuery = useQuery({
    queryKey: ["crystal-reports", "published", "countries"],
    queryFn: () => crystalReportService.listPublished("countries"),
    enabled: reportMode === "crystal",
    staleTime: 5 * 60_000,
  });
  const reportsInfo = reportsQuery.data ?? [];
  const reportOptions = reportsInfo.map((report) => ({
    ...report,
    localizedName: (i18n.dir() === "rtl" ? report.summaryTitle : report.summarySubject)
      || report.displayName,
  }));
  const selectedReport = reportsInfo.find((report) => report.id === selectedReportId)
    ?? reportsInfo[0]
    ?? null;

  const handleReportChange = (value: unknown) => {
    const selected = reportsInfo.find((report) => report.id === selectionValue(value));
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

  const handleReportModeChange = (_event: React.MouseEvent<HTMLElement>, value: CountryReportMode | null) => {
    if (value && (value !== "designer" || canManageTemplates)) setReportMode(value);
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
          {canViewTemplates ? (
            <ToggleButton value="activeReports">
              {t("countries.activeReports.viewerMode")}
            </ToggleButton>
          ) : null}
          {canManageTemplates ? (
            <ToggleButton value="designer">
              {t("countries.activeReports.designerMode")}
            </ToggleButton>
          ) : null}
        </ToggleButtonGroup>
      </Box>

      {reportMode === "designer" && canManageTemplates ? (
        <CountryActiveReportsDesigner />
      ) : reportMode === "activeReports" && canViewTemplates ? (
        <ServerReportViewer
          featureKey="countries"
          labels={{
            title: t("countries.activeReports.viewerTitle"),
            description: t("countries.activeReports.viewerDescription"),
            selectTemplate: t("countries.activeReports.selectTemplate"),
            noTemplates: t("countries.activeReports.noPublishedTemplates"),
            loadError: t("countries.activeReports.viewerLoadError"),
          }}
        />
      ) : reportsQuery.isLoading ? (
        <Box sx={{ display: "grid", flex: 1, placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : !selectedReport ? (
        <Alert
          severity={reportsQuery.isError ? "warning" : "info"}
          action={(
            <Button color="inherit" size="small" onClick={() => void reportsQuery.refetch()}>
              {t("common.retry")}
            </Button>
          )}
          sx={{ m: 1.5 }}
        >
          {reportsQuery.isError
            ? t("countries.reportCatalogError")
            : t("countries.reportUnavailable")}
        </Alert>
      ) : (
        <ReportViewer
          renderReport={renderCrystalReport}
          renderKey={selectedReport.id}
          filterBarVisible={showFilterBar}
        >
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
                    fieldName="NameAr"
                    value={String(currentParams.NameAr ?? "")}
                    label={t("countries.arabicName")}
                    onChange={(event) =>
                      updateSearchParams({ NameAr: event.target.value })
                    }
                    onClear={() => updateSearchParams({ NameAr: null })}
                    appearance="plain"
                    margin="none"
                    showCounter={false}
                    clearButtonAriaLabel={t("general.clearSearch")}
                  />

                  <MyTextField
                    fieldName="NameEn"
                    value={String(currentParams.NameEn ?? "")}
                    label={t("countries.englishName")}
                    onChange={(event) =>
                      updateSearchParams({ NameEn: event.target.value })
                    }
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
                    loading={reportsQuery.isLoading || reportsQuery.isFetching}
                    label={t("reports.reportForms")}
                    valueMember="id"
                    displayMember="localizedName"
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
