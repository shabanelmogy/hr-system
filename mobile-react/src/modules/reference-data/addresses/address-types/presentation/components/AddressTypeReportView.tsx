import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedCrystalReportView } from '@/src/platform/reporting';

export function AddressTypeReportView() {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: 'NameEn', label: t('addressTypes.reportNameEn') },
    { key: 'NameAr', label: t('addressTypes.reportNameAr') },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="addresstypes"
      fallbackFileName="AddressTypes"
      filters={filters}
      translationPrefix="addressTypes"
    />
  );
}
