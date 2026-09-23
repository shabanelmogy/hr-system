import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedCrystalReportView } from '@/src/platform/reporting';

export function DistrictReportView() {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: 'NameEn', label: t('districts.reportNameEn') },
    { key: 'NameAr', label: t('districts.reportNameAr') },
    { key: 'StateEn', label: t('districts.reportStateEn') },
    { key: 'StateAr', label: t('districts.reportStateAr') },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="districts"
      scope="global"
      fallbackFileName="Districts"
      filters={filters}
      translationPrefix="districts"
    />
  );
}
