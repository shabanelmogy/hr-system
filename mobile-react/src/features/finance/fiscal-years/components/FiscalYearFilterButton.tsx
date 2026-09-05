import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { FiscalYearFilters, FiscalYearSearchField, FiscalYearSearchOperator } from '../types/fiscal-year';

interface Values extends FiscalYearFilters { field: FiscalYearSearchField; operator: FiscalYearSearchOperator }
const defaults: Values = { field: 'all', operator: 'contains', recordStatus: 'active', lifecycleStatus: 'all' };
export function FiscalYearFilterButton({ values, onApply }: { values: Values; onApply: (values: Values) => void }) {
  const { t } = useTranslation(); const [draft, setDraft] = useState(values);
  const activeCount = Number(values.field !== defaults.field) + Number(values.operator !== defaults.operator) + Number(values.recordStatus !== defaults.recordStatus) + Number(values.lifecycleStatus !== defaults.lifecycleStatus);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('fiscalYears.filters.title')} modalTitle={t('fiscalYears.filters.title')} description={t('fiscalYears.filters.description')} onOpen={() => setDraft(values)} onClear={() => setDraft(defaults)} onApply={() => onApply(draft)} clearDisabled={JSON.stringify(draft) === JSON.stringify(defaults)}>
    <AppSelectField allowWhenReadOnly label={t('fiscalYears.filters.recordStatus')} value={draft.recordStatus} onChange={recordStatus => setDraft(current => ({ ...current, recordStatus }))} options={(['active', 'archived', 'all'] as const).map(value => ({ value, label: t(`fiscalYears.recordStatus.${value}`), icon: value === 'archived' ? 'archive-outline' : value === 'active' ? 'checkmark-circle-outline' : 'albums-outline' }))} />
    <AppSelectField allowWhenReadOnly label={t('fiscalYears.filters.lifecycle')} value={draft.lifecycleStatus} onChange={lifecycleStatus => setDraft(current => ({ ...current, lifecycleStatus }))} options={(['all', 'draft', 'open', 'closing', 'closed', 'locked'] as const).map(value => ({ value, label: t(`fiscalYears.status.${value}`), icon: value === 'locked' ? 'lock-closed-outline' : 'calendar-outline' }))} />
    <AppSearchFilterControls field={draft.field} fieldLabel={t('fiscalYears.filters.searchField')} operator={draft.operator} operatorLabel={t('fiscalYears.filters.operator')} onFieldChange={field => setDraft(current => ({ ...current, field }))} onOperatorChange={operator => setDraft(current => ({ ...current, operator }))}
      fieldOptions={(['all', 'code', 'nameAr', 'nameEn'] as const).map(value => ({ value, label: t(`fiscalYears.search.fields.${value}`), icon: value === 'code' ? 'pricetag-outline' : 'language-outline' }))}
      operatorOptions={(['contains', 'doesNotContain', 'equals', 'doesNotEqual', 'startsWith', 'endsWith'] as const).map(value => ({ value, label: t(`fiscalYears.search.operators.${value}`), icon: 'search-outline' }))} />
  </AppFilterFormButton>;
}
