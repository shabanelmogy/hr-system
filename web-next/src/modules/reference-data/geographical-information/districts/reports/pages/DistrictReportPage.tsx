"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ManagedCrystalReportView } from "@/modules/reporting/public";

export default function DistrictReportPage({ showFilterBar = true }: { showFilterBar?: boolean }) {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: "NameAr", label: t("general.nameAr") },
    { key: "NameEn", label: t("general.nameEn") },
    { key: "StateAr", label: t("districts.stateNameAr") },
    { key: "StateEn", label: t("districts.stateNameEn") },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="districts"
      scope="global"
      catalogErrorMessage={t("districts.reportCatalogError")}
      unavailableMessage={t("districts.reportUnavailable")}
      filters={filters}
      showFilterBar={showFilterBar}
    />
  );
}
