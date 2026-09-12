import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSelectField, type AppSelectOption } from '@/src/shared/components';

export interface WorkforceBudgetFilters { status: string; fiscalYearId: number }
const defaults: WorkforceBudgetFilters = { status: 'all', fiscalYearId: 0 };

export function WorkforceBudgetFilterButton({ values, fiscalYears, onApply }: { values: WorkforceBudgetFilters; fiscalYears: AppSelectOption<number>[]; onApply: (values: WorkforceBudgetFilters) => void }) {
  const { t } = useTranslation(); const [draft, setDraft] = useState(values);
  const activeCount = Number(values.status !== defaults.status) + Number(values.fiscalYearId !== defaults.fiscalYearId);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('workforceBudget.filters.title')} modalTitle={t('workforceBudget.filters.title')} description={t('workforceBudget.filters.description')} onOpen={() => setDraft(values)} onClear={() => setDraft(defaults)} onApply={() => onApply(draft)} clearDisabled={draft.status === defaults.status && draft.fiscalYearId === defaults.fiscalYearId}>
    <AppSelectField allowWhenReadOnly label={t('workforceBudget.filters.status')} value={draft.status} onChange={status => setDraft(current => ({ ...current, status }))} options={['all', 'draft', 'submitted', 'approved', 'rejected', 'superseded', 'closed'].map(value => ({ value, label: t(value === 'all' ? 'common.all' : `workforceBudget.status.${value}`), icon: value === 'approved' ? 'checkmark-circle-outline' : 'layers-outline' }))} />
    <AppSelectField allowWhenReadOnly label={t('workforceBudget.fields.fiscalYear')} value={draft.fiscalYearId} onChange={fiscalYearId => setDraft(current => ({ ...current, fiscalYearId }))} options={[{ value: 0, label: t('common.all'), icon: 'albums-outline' }, ...fiscalYears]} />
  </AppFilterFormButton>;
}
