import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { AccountRecordStatus, AccountSearchField, AccountSearchOperator } from '../../domain/models/coa-hierarchy';

export interface AccountFilterValues {
  recordStatus: AccountRecordStatus;
  searchField: AccountSearchField;
  searchOperator: AccountSearchOperator;
}

interface Props { values: AccountFilterValues; onApply: (values: AccountFilterValues) => void }
const defaults: AccountFilterValues = { recordStatus: 'active', searchField: 'all', searchOperator: 'contains' };

export function AccountFilterButton({ values, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(values);
  const activeCount = Number(values.recordStatus !== defaults.recordStatus) + Number(values.searchField !== defaults.searchField) + Number(values.searchOperator !== defaults.searchOperator);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('coaHierarchy.filters.title')} modalTitle={t('coaHierarchy.filters.title')} description={t('coaHierarchy.filters.description')} onOpen={() => setDraft(values)} onClear={() => setDraft(defaults)} onApply={() => onApply(draft)} clearDisabled={JSON.stringify(draft) === JSON.stringify(defaults)}>
    <AppSelectField allowWhenReadOnly label={t('coaHierarchy.filters.status')} value={draft.recordStatus} onChange={recordStatus => setDraft(current => ({ ...current, recordStatus }))} options={(['active', 'archived', 'all'] as const).map(value => ({ value, label: t(`coaHierarchy.status.${value}`), icon: value === 'archived' ? 'archive-outline' : value === 'active' ? 'checkmark-circle-outline' : 'albums-outline' }))} />
    <AppSearchFilterControls<AccountSearchField, AccountSearchOperator>
      field={draft.searchField}
      fieldLabel={t('coaHierarchy.filters.searchField')}
      fieldOptions={([['all', 'apps-outline'], ['code', 'pricetag-outline'], ['nameAr', 'language-outline'], ['nameEn', 'language-outline']] as const).map(([value, icon]) => ({ value, label: t(`coaHierarchy.search.fields.${value}`), icon }))}
      onFieldChange={searchField => setDraft(current => ({ ...current, searchField }))}
      onOperatorChange={searchOperator => setDraft(current => ({ ...current, searchOperator }))}
      operator={draft.searchOperator}
      operatorLabel={t('coaHierarchy.filters.operator')}
      operatorOptions={(['contains', 'doesNotContain', 'equals', 'doesNotEqual', 'startsWith', 'endsWith'] as const).map(value => ({ value, label: t(`coaHierarchy.search.operators.${value}`), icon: 'search-outline' }))}
    />
  </AppFilterFormButton>;
}
