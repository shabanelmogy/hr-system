import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedCrystalReportView } from '@/src/platform/reporting';

export function CountryReportView() {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: 'NameEn', label: t('countries.reportNameEn') },
    { key: 'NameAr', label: t('countries.reportNameAr') },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="countries"
      scope="global"
      fallbackFileName="Countries"
      filters={filters}
      translationPrefix="countries"
    />
  );
}
