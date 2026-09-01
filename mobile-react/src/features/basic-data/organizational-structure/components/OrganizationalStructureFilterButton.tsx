import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFilterFormButton, AppSearchFilterControls, AppSelectField } from '@/src/shared/components';
import type { OrganizationalResource, OrganizationalSearchField, OrganizationalSearchOperator, OrganizationalStatus } from '../types/organizational-structure';

interface Values { field: OrganizationalSearchField; operator: OrganizationalSearchOperator; status: OrganizationalStatus }
interface Props extends Values { resource?: OrganizationalResource; onApply: (values: Values) => void }
const defaults: Values = { field: 'all', operator: 'contains', status: 'active' };

export function OrganizationalStructureFilterButton({ field, operator, status, resource, onApply }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Values>({ field, operator, status });
  const activeCount = Number(status !== defaults.status) + Number(field !== defaults.field) + Number(operator !== defaults.operator);
  return <AppFilterFormButton activeCount={activeCount} buttonLabel={t('organizationalStructure.filters')} clearDisabled={status === defaults.status && field === defaults.field && operator === defaults.operator} description={t('organizationalStructure.filterOptionsDescription')} modalTitle={t('organizationalStructure.filterOptions')} onApply={() => onApply(draft)} onClear={() => setDraft(defaults)} onOpen={() => setDraft({ field, operator, status })}>
    <AppSelectField allowWhenReadOnly label={t('organizationalStructure.fields.status')} leadingIcon="checkmark-circle-outline" onChange={(value) => setDraft((current) => ({ ...current, status: value as OrganizationalStatus }))} options={(resource === 'job-descriptions' ? ['active', 'archived', 'all', 'draft', 'approved', 'rejected', 'expired'] : ['active', 'archived', 'all']).map((value) => ({ value, label: t(`organizationalStructure.status.${value}`), icon: value === 'active' || value === 'approved' ? 'checkmark-circle-outline' as const : value === 'archived' || value === 'expired' ? 'archive-outline' as const : 'albums-outline' as const }))} value={draft.status} />
    <AppSearchFilterControls<OrganizationalSearchField, OrganizationalSearchOperator> field={draft.field} fieldLabel={t('organizationalStructure.searchColumn')} fieldOptions={[
      { value: 'all', label: t('organizationalStructure.allColumns'), icon: 'apps-outline' }, { value: 'nameEn', label: t('organizationalStructure.fields.nameEn'), icon: 'language-outline' }, { value: 'nameAr', label: t('organizationalStructure.fields.nameAr'), icon: 'language-outline' }, { value: 'code', label: t('organizationalStructure.fields.code'), icon: 'pricetag-outline' }, { value: 'parent', label: t('organizationalStructure.fields.parent'), icon: 'git-branch-outline' },
    ]} onFieldChange={(value) => setDraft((current) => ({ ...current, field: value }))} onOperatorChange={(value) => setDraft((current) => ({ ...current, operator: value }))} operator={draft.operator} operatorLabel={t('organizationalStructure.searchCondition')} operatorOptions={[
      { value: 'contains', label: t('organizationalStructure.contains'), icon: 'search-outline' }, { value: 'doesNotContain', label: t('organizationalStructure.doesNotContain'), icon: 'close-circle-outline' }, { value: 'equals', label: t('organizationalStructure.equals'), icon: 'checkmark-circle-outline' }, { value: 'doesNotEqual', label: t('organizationalStructure.doesNotEqual'), icon: 'remove-circle-outline' }, { value: 'startsWith', label: t('organizationalStructure.startsWith'), icon: 'arrow-forward-outline' }, { value: 'endsWith', label: t('organizationalStructure.endsWith'), icon: 'arrow-back-outline' },
    ]} />
  </AppFilterFormButton>;
}
