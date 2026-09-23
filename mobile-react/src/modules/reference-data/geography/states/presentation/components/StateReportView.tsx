import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedCrystalReportView } from '@/src/platform/reporting';

export function StateReportView() {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: 'NameEn', label: t('states.reportNameEn') },
    { key: 'NameAr', label: t('states.reportNameAr') },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="states"
      scope="global"
      fallbackFileName="States"
      filters={filters}
      translationPrefix="states"
    />
  );
}
