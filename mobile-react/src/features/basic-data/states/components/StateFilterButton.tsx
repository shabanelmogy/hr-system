import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { StateFilters, StateSearchField, StateSearchOperator } from '../types/state';

interface StateFilterValues {
  field: StateSearchField;
  operator: StateSearchOperator;
  status: StateFilters['status'];
}

interface StateFilterButtonProps extends StateFilterValues {
  onApply: (values: StateFilterValues) => void;
}

const defaultValues: StateFilterValues = {
  field: 'all',
  operator: 'contains',
  status: 'active',
};

export function StateFilterButton({ field, operator, status, onApply }: StateFilterButtonProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<StateFilterValues>({ field, operator, status });
  const activeCount = Number(status !== defaultValues.status)
    + Number(field !== defaultValues.field)
    + Number(operator !== defaultValues.operator);

  const resetDraft = () => setDraft({ field, operator, status });

  return (
    <AppFilterFormButton
      activeCount={activeCount}
      buttonLabel={t('states.filters')}
      clearDisabled={draft.field === defaultValues.field && draft.operator === defaultValues.operator && draft.status === defaultValues.status}
      description={t('states.filterOptionsDescription')}
      modalTitle={t('states.filterOptions')}
      onApply={() => onApply(draft)}
      onClear={() => setDraft(defaultValues)}
      onOpen={resetDraft}>
      <AppSelectField
        allowWhenReadOnly
        label={t('states.status')}
        leadingIcon="checkmark-circle-outline"
        onChange={(value) => setDraft((current) => ({ ...current, status: value as StateFilters['status'] }))}
        options={[
          { value: 'active', label: t('states.active'), icon: 'checkmark-circle-outline' },
          { value: 'archived', label: t('states.archived'), icon: 'archive-outline' },
          { value: 'all', label: t('states.all'), icon: 'albums-outline' },
        ]}
        value={draft.status}
      />
      <AppSearchFilterControls<StateSearchField, StateSearchOperator>
        field={draft.field}
        fieldLabel={t('states.searchColumn')}
        fieldOptions={[
          { value: 'all', label: t('states.allColumns'), icon: 'apps-outline' },
          { value: 'nameEn', label: t('states.nameEn'), icon: 'language-outline' },
          { value: 'nameAr', label: t('states.nameAr'), icon: 'language-outline' },
          { value: 'code', label: t('states.code'), icon: 'pricetag-outline' },
          { value: 'country', label: t('states.country'), icon: 'flag-outline' },
        ]}
        onFieldChange={(value) => setDraft((current) => ({ ...current, field: value }))}
        onOperatorChange={(value) => setDraft((current) => ({ ...current, operator: value }))}
        operator={draft.operator}
        operatorLabel={t('states.searchCondition')}
        operatorOptions={[
          { value: 'contains', label: t('states.contains'), icon: 'search-outline' },
          { value: 'doesNotContain', label: t('states.doesNotContain'), icon: 'close-circle-outline' },
          { value: 'equals', label: t('states.equals'), icon: 'checkmark-circle-outline' },
          { value: 'doesNotEqual', label: t('states.doesNotEqual'), icon: 'remove-circle-outline' },
          { value: 'startsWith', label: t('states.startsWith'), icon: 'arrow-forward-outline' },
          { value: 'endsWith', label: t('states.endsWith'), icon: 'arrow-back-outline' },
        ]}
      />
    </AppFilterFormButton>
  );
}
