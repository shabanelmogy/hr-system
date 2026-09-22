import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { CurrencyFilters, CurrencySearchField, CurrencySearchOperator } from '../../domain/models/currency';

interface Values { field: CurrencySearchField; operator: CurrencySearchOperator; recordStatus: CurrencyFilters['recordStatus'] }
interface Props { values: Values; onApply: (values: Values) => void }
const defaults: Values = { field: 'all', operator: 'contains', recordStatus: 'active' };

export function CurrencyFilterButton({ values, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(values);
  const activeCount = Number(values.recordStatus !== defaults.recordStatus) + Number(values.field !== defaults.field) + Number(values.operator !== defaults.operator);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('currencies.filters.title')} modalTitle={t('currencies.filters.title')} description={t('currencies.filters.description')} onOpen={() => setDraft(values)} onClear={() => setDraft(defaults)} onApply={() => onApply(draft)} clearDisabled={JSON.stringify(draft) === JSON.stringify(defaults)}>
    <AppSelectField allowWhenReadOnly label={t('currencies.filters.recordStatus')} value={draft.recordStatus} onChange={recordStatus => setDraft(current => ({ ...current, recordStatus }))} options={(['active', 'archived', 'all'] as const).map(value => ({ value, label: t(`currencies.recordStatus.${value}`), icon: value === 'archived' ? 'archive-outline' : value === 'active' ? 'checkmark-circle-outline' : 'albums-outline' }))} />
    <AppSearchFilterControls<CurrencySearchField, CurrencySearchOperator>
      field={draft.field}
      fieldLabel={t('currencies.filters.searchField')}
      fieldOptions={([
        ['all', 'apps-outline'], ['currencyCode', 'pricetag-outline'], ['nameAr', 'language-outline'], ['nameEn', 'language-outline'], ['symbol', 'cash-outline'],
      ] as const).map(([value, icon]) => ({ value, label: t(`currencies.search.fields.${value}`), icon }))}
      onFieldChange={field => setDraft(current => ({ ...current, field }))}
      onOperatorChange={operator => setDraft(current => ({ ...current, operator }))}
      operator={draft.operator}
      operatorLabel={t('currencies.filters.operator')}
      operatorOptions={(['contains', 'doesNotContain', 'equals', 'doesNotEqual', 'startsWith', 'endsWith'] as const).map(value => ({ value, label: t(`currencies.search.operators.${value}`), icon: 'search-outline' }))}
    />
  </AppFilterFormButton>;
}
