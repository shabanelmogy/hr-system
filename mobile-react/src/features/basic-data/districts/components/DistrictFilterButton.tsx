import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { DistrictFilters, DistrictSearchField, DistrictSearchOperator } from '../types/district';

interface DistrictFilterValues {
  field: DistrictSearchField;
  operator: DistrictSearchOperator;
  status: DistrictFilters['status'];
}

interface DistrictFilterButtonProps extends DistrictFilterValues {
  onApply: (values: DistrictFilterValues) => void;
}

const defaultValues: DistrictFilterValues = {
  field: 'all',
  operator: 'contains',
  status: 'active',
};

export function DistrictFilterButton({ field, operator, status, onApply }: DistrictFilterButtonProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<DistrictFilterValues>({ field, operator, status });
  const activeCount = Number(status !== defaultValues.status)
    + Number(field !== defaultValues.field)
    + Number(operator !== defaultValues.operator);

  const resetDraft = () => setDraft({ field, operator, status });

  return (
    <AppFilterFormButton
      activeCount={activeCount}
      buttonLabel={t('districts.filters')}
      clearDisabled={draft.field === defaultValues.field && draft.operator === defaultValues.operator && draft.status === defaultValues.status}
      description={t('districts.filterOptionsDescription')}
      modalTitle={t('districts.filterOptions')}
      onApply={() => onApply(draft)}
      onClear={() => setDraft(defaultValues)}
      onOpen={resetDraft}>
      <AppSelectField
        allowWhenReadOnly
        label={t('districts.status')}
        leadingIcon="checkmark-circle-outline"
        onChange={(value) => setDraft((current) => ({ ...current, status: value as DistrictFilters['status'] }))}
        options={[
          { value: 'active', label: t('districts.active'), icon: 'checkmark-circle-outline' },
          { value: 'archived', label: t('districts.archived'), icon: 'archive-outline' },
          { value: 'all', label: t('districts.all'), icon: 'albums-outline' },
        ]}
        value={draft.status}
      />
      <AppSearchFilterControls<DistrictSearchField, DistrictSearchOperator>
        field={draft.field}
        fieldLabel={t('districts.searchColumn')}
        fieldOptions={[
          { value: 'all', label: t('districts.allColumns'), icon: 'apps-outline' },
          { value: 'nameEn', label: t('districts.nameEn'), icon: 'language-outline' },
          { value: 'nameAr', label: t('districts.nameAr'), icon: 'language-outline' },
          { value: 'code', label: t('districts.code'), icon: 'pricetag-outline' },
          { value: 'state', label: t('districts.state'), icon: 'flag-outline' },
        ]}
        onFieldChange={(value) => setDraft((current) => ({ ...current, field: value }))}
        onOperatorChange={(value) => setDraft((current) => ({ ...current, operator: value }))}
        operator={draft.operator}
        operatorLabel={t('districts.searchCondition')}
        operatorOptions={[
          { value: 'contains', label: t('districts.contains'), icon: 'search-outline' },
          { value: 'doesNotContain', label: t('districts.doesNotContain'), icon: 'close-circle-outline' },
          { value: 'equals', label: t('districts.equals'), icon: 'checkmark-circle-outline' },
          { value: 'doesNotEqual', label: t('districts.doesNotEqual'), icon: 'remove-circle-outline' },
          { value: 'startsWith', label: t('districts.startsWith'), icon: 'arrow-forward-outline' },
          { value: 'endsWith', label: t('districts.endsWith'), icon: 'arrow-back-outline' },
        ]}
      />
    </AppFilterFormButton>
  );
}
