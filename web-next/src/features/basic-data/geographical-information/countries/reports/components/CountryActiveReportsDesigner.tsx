"use client";

import { useTranslation } from "react-i18next";
import { apiRoutes } from "@/config";
import { ServerReportDesigner } from "@/features/reporting";

/** Countries supplies only feature vocabulary and its approved API dataset. */
const CountryActiveReportsDesigner = () => {
  const { t } = useTranslation();

  return (
    <ServerReportDesigner
      dataSource={{
        key: "countries",
        expectedApiPath: apiRoutes.countries.reportData,
        dataSetName: "Countries",
        fields: [
          "id",
          "nameAr",
          "nameEn",
          "alpha2Code",
          "alpha3Code",
          "phoneCode",
          "currencyCode",
          "isActive",
        ],
      }}
      featureKey="countries"
      labels={{
        title: t("countries.activeReports.designerTitle"),
        description: t("countries.activeReports.designerDescription"),
        starterTemplateName: t("countries.activeReports.starterTemplateName"),
        dataSourceGuidance: t("countries.activeReports.dataSourceGuidance"),
        unsavedChanges: t("countries.activeReports.unsavedChanges"),
        templateLoadError: t("countries.activeReports.templateLoadError"),
        templateSaveError: t("countries.activeReports.templateSaveError"),
        concurrencyError: t("countries.activeReports.concurrencyError"),
        openTemplate: t("countries.activeReports.openTemplate"),
        noTemplates: t("countries.activeReports.noTemplates"),
        cancel: t("common.cancel"),
        published: t("countries.activeReports.published"),
        draft: t("countries.activeReports.draft"),
        publish: t("countries.activeReports.publish"),
        permissionDenied: t("countries.activeReports.permissionDenied"),
        dataSourceUnavailable: t("countries.activeReports.dataSourceUnavailable"),
      }}
      starterReport={{
        id: "/reports/countries/countries-directory.rdlx-json",
        displayName: t("countries.activeReports.starterTemplateName"),
      }}
    />
  );
};

export default CountryActiveReportsDesigner;
