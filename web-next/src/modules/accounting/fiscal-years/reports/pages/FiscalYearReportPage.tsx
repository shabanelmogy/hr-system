"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ManagedCrystalReportView } from "@/modules/reporting/public";

export default function FiscalYearReportPage({ showFilterBar = true }: { showFilterBar?: boolean }) {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: "Code", label: t("fiscalYears.fields.code") },
    { key: "NameAr", label: t("general.nameAr") },
    { key: "NameEn", label: t("general.nameEn") },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="fiscalyears"
      catalogErrorMessage={t("fiscalYears.report.catalogError")}
      unavailableMessage={t("fiscalYears.report.unavailable")}
      filters={filters}
      showFilterBar={showFilterBar}
    />
  );
}
