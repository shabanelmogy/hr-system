"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ManagedCrystalReportView } from "@/modules/reporting/public";

export default function StateReportPage({ showFilterBar = true }: { showFilterBar?: boolean }) {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: "NameAr", label: t("general.nameAr") },
    { key: "NameEn", label: t("general.nameEn") },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="states"
      scope="global"
      catalogErrorMessage={t("states.reportCatalogError")}
      unavailableMessage={t("states.reportUnavailable")}
      filters={filters}
      showFilterBar={showFilterBar}
    />
  );
}
