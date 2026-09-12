import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { CountryFilters, CountrySearchField, CountrySearchOperator } from '../types/country';

interface CountryFilterValues {
  field: CountrySearchField;
  operator: CountrySearchOperator;
  status: CountryFilters['status'];
}

interface CountryFilterButtonProps extends CountryFilterValues {
  onApply: (values: CountryFilterValues) => void;
}

const defaultValues: CountryFilterValues = {
  field: 'all',
  operator: 'contains',
  status: 'active',
};

export function CountryFilterButton({ field, operator, status, onApply }: CountryFilterButtonProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CountryFilterValues>({ field, operator, status });
  const activeCount = Number(status !== defaultValues.status)
    + Number(field !== defaultValues.field)
    + Number(operator !== defaultValues.operator);

  return (
    <AppFilterFormButton
      activeCount={activeCount}
      buttonLabel={t('countries.filters')}
      clearDisabled={draft.field === defaultValues.field && draft.operator === defaultValues.operator && draft.status === defaultValues.status}
      description={t('countries.filterOptionsDescription')}
      modalTitle={t('countries.filterOptions')}
      onApply={() => onApply(draft)}
      onClear={() => setDraft(defaultValues)}
      onOpen={() => setDraft({ field, operator, status })}>
      <AppSelectField
        allowWhenReadOnly
        label={t('countries.status')}
        leadingIcon="checkmark-circle-outline"
        onChange={(value) => setDraft((current) => ({ ...current, status: value as CountryFilters['status'] }))}
        options={[
          { value: 'active', label: t('countries.active'), icon: 'checkmark-circle-outline' },
          { value: 'archived', label: t('countries.archived'), icon: 'archive-outline' },
          { value: 'all', label: t('countries.all'), icon: 'albums-outline' },
        ]}
        value={draft.status}
      />
      <AppSearchFilterControls<CountrySearchField, CountrySearchOperator>
        field={draft.field}
        fieldLabel={t('countries.searchColumn')}
        fieldOptions={[
          { value: 'all', label: t('countries.allColumns'), icon: 'apps-outline' },
          { value: 'nameEn', label: t('countries.nameEn'), icon: 'language-outline' },
          { value: 'nameAr', label: t('countries.nameAr'), icon: 'language-outline' },
          { value: 'alpha2Code', label: t('countries.alpha2Code'), icon: 'pricetag-outline' },
          { value: 'alpha3Code', label: t('countries.alpha3Code'), icon: 'pricetag-outline' },
          { value: 'phoneCode', label: t('countries.phoneCode'), icon: 'call-outline' },
          { value: 'currencyCode', label: t('countries.currencyCode'), icon: 'cash-outline' },
        ]}
        onFieldChange={(value) => setDraft((current) => ({ ...current, field: value }))}
        onOperatorChange={(value) => setDraft((current) => ({ ...current, operator: value }))}
        operator={draft.operator}
        operatorLabel={t('countries.searchCondition')}
        operatorOptions={[
          { value: 'contains', label: t('countries.contains'), icon: 'search-outline' },
          { value: 'doesNotContain', label: t('countries.doesNotContain'), icon: 'close-circle-outline' },
          { value: 'equals', label: t('countries.equals'), icon: 'checkmark-circle-outline' },
          { value: 'doesNotEqual', label: t('countries.doesNotEqual'), icon: 'remove-circle-outline' },
          { value: 'startsWith', label: t('countries.startsWith'), icon: 'arrow-forward-outline' },
          { value: 'endsWith', label: t('countries.endsWith'), icon: 'arrow-back-outline' },
        ]}
      />
    </AppFilterFormButton>
  );
}
