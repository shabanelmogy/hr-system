import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSelectField } from '@/src/shared/components';
import type { AccountRecordStatus } from '../../domain/models/coa-hierarchy';

interface Props { value: AccountRecordStatus; onApply: (value: AccountRecordStatus) => void }

export function HierarchyLevelFilterButton({ value, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  return <AppFilterFormButton activeCount={Number(value !== 'active')} buttonLabel={t('coaHierarchy.filters.title')} modalTitle={t('coaHierarchy.filters.title')} onOpen={() => setDraft(value)} onClear={() => setDraft('active')} onApply={() => onApply(draft)} clearDisabled={draft === 'active'}>
    <AppSelectField allowWhenReadOnly label={t('coaHierarchy.filters.status')} value={draft} onChange={setDraft} options={(['active', 'archived', 'all'] as const).map(status => ({ value: status, label: t(`coaHierarchy.status.${status}`), icon: status === 'archived' ? 'archive-outline' : status === 'active' ? 'checkmark-circle-outline' : 'albums-outline' }))} />
  </AppFilterFormButton>;
}
