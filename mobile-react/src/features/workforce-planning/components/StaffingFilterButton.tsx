import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSelectField } from '@/src/shared/components';

export function StaffingFilterButton({ value, amendment = false, onApply }: { value: string; amendment?: boolean; onApply: (value: string) => void }) {
  const { t } = useTranslation(); const [draft, setDraft] = useState(value);
  const statuses = amendment ? ['draft', 'submitted', 'approved', 'rejected'] : ['draft', 'submitted', 'approved', 'rejected', 'closed'];
  return <AppFilterFormButton activeCount={value === 'all' ? 0 : 1} buttonLabel={t('staffing.fields.status')} modalTitle={t('staffing.fields.status')} description={t('staffing.filters.description')} onOpen={() => setDraft(value)} onClear={() => setDraft('all')} onApply={() => onApply(draft)} clearDisabled={draft === 'all'}>
    <AppSelectField allowWhenReadOnly label={t('staffing.fields.status')} value={draft} onChange={setDraft} options={[{ value: 'all', label: t('common.all'), icon: 'layers-outline' }, ...statuses.map((status, index) => ({ value: status, label: t(amendment ? `staffing.amendmentStatus.${index + 1}` : `staffing.status.${index + 1}`), icon: status === 'approved' ? 'checkmark-circle-outline' as const : 'layers-outline' as const }))]} />
  </AppFilterFormButton>;
}
