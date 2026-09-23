"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ManagedCrystalReportView } from "@/modules/reporting/public";

export default function CountryReportPage({ showFilterBar = true }: { showFilterBar?: boolean }) {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: "NameAr", label: t("general.nameAr") },
    { key: "NameEn", label: t("general.nameEn") },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="countries"
      scope="global"
      catalogErrorMessage={t("countries.reportCatalogError")}
      unavailableMessage={t("countries.reportUnavailable")}
      filters={filters}
      showFilterBar={showFilterBar}
    />
  );
}
