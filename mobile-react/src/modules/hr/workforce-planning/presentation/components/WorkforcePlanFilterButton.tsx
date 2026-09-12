import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSelectField, type AppSelectOption } from '@/src/shared/components';

export interface WorkforcePlanFilters { status: string; recordStatus: 'active' | 'archived' | 'all'; fiscalYearId: number }
const defaults: WorkforcePlanFilters = { status: 'all', recordStatus: 'active', fiscalYearId: 0 };

export function WorkforcePlanFilterButton({ values, fiscalYears, onApply }: { values: WorkforcePlanFilters; fiscalYears: AppSelectOption<number>[]; onApply: (values: WorkforcePlanFilters) => void }) {
  const { t } = useTranslation(); const [draft, setDraft] = useState(values);
  const activeCount = Number(values.status !== defaults.status) + Number(values.recordStatus !== defaults.recordStatus) + Number(values.fiscalYearId !== defaults.fiscalYearId);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('workforcePlanning.filters.title')} modalTitle={t('workforcePlanning.filters.title')} description={t('workforcePlanning.filters.description')} onOpen={() => setDraft(values)} onClear={() => setDraft(defaults)} onApply={() => onApply(draft)} clearDisabled={draft.status === defaults.status && draft.recordStatus === defaults.recordStatus && draft.fiscalYearId === defaults.fiscalYearId}>
    <AppSelectField allowWhenReadOnly label={t('workforcePlanning.filters.status')} value={draft.status} onChange={status => setDraft(current => ({ ...current, status }))} options={['all', 'draft', 'submitted', 'underReview', 'approved', 'rejected', 'superseded'].map(value => ({ value, label: t(value === 'all' ? 'common.all' : `workforcePlanning.status.${value}`), icon: value === 'approved' ? 'checkmark-circle-outline' : 'layers-outline' }))} />
    <AppSelectField allowWhenReadOnly label={t('workforcePlanning.filters.recordStatus')} value={draft.recordStatus} onChange={recordStatus => setDraft(current => ({ ...current, recordStatus }))} options={(['active', 'archived', 'all'] as const).map(value => ({ value, label: t(`workforcePlanning.recordStatus.${value}`), icon: value === 'archived' ? 'archive-outline' : value === 'all' ? 'albums-outline' : 'checkmark-circle-outline' }))} />
    <AppSelectField allowWhenReadOnly label={t('workforcePlanning.fields.fiscalYear')} value={draft.fiscalYearId} onChange={fiscalYearId => setDraft(current => ({ ...current, fiscalYearId }))} options={[{ value: 0, label: t('common.all'), icon: 'albums-outline' }, ...fiscalYears]} />
  </AppFilterFormButton>;
}
