import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ManagedCrystalReportView } from '@/src/platform/reporting';

export function FiscalYearReportView() {
  const { t } = useTranslation();
  const filters = useMemo(() => [
    { key: 'Code', label: t('fiscalYears.fields.code') },
    { key: 'NameEn', label: t('fiscalYears.fields.nameEn') },
    { key: 'NameAr', label: t('fiscalYears.fields.nameAr') },
  ], [t]);

  return (
    <ManagedCrystalReportView
      entityKey="fiscalyears"
      fallbackFileName="FiscalYears"
      filters={filters}
      translationPrefix="fiscalYears.report"
    />
  );
}
