import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ManagedCrystalReportView } from "@/modules/reporting/public";

interface AddressTypeReportPageProps { showFilterBar?: boolean; }

export default function AddressTypeReportPage({ showFilterBar = true }: AddressTypeReportPageProps) {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: "NameAr", label: t("general.nameAr") },
    { key: "NameEn", label: t("general.nameEn") },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="addresstypes"
      catalogErrorMessage={t("addressTypes.reportCatalogError")}
      unavailableMessage={t("addressTypes.reportUnavailable")}
      filters={filters}
      showFilterBar={showFilterBar}
    />
  );
}
