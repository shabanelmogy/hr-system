import { useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppSelectField, AppSwitchField, AppTextField } from '@/src/shared/components';
import { useOrganizationalLookup } from '../queries/use-organizational-structure';
import type { OrganizationalResource, OrganizationalStructureItem, OrganizationalStructureRequest } from '../types/organizational-structure';
import { createOrganizationalStructureSchema } from '../validation/organizational-structure-schema';

interface Props { resource: OrganizationalResource; item: OrganizationalStructureItem | null; mode: 'create' | 'edit' | 'view'; loading: boolean; onClose: () => void; onSave: (request: OrganizationalStructureRequest) => Promise<void>; }
const numberText = (value?: number) => value == null ? '' : String(value);
const optionalNumber = (value: string) => value.trim() ? Number(value) : undefined;

export function OrganizationalStructureForm({ resource, item, mode, loading, onClose, onSave }: Props) {
  const { t } = useTranslation(); const readOnly = mode === 'view';
  const schema = useMemo(() => createOrganizationalStructureSchema(resource, t), [resource, t]); type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({
    code: item?.code ?? '', nameEn: item?.nameEn ?? '', nameAr: item?.nameAr ?? '', descriptionEn: item?.descriptionEn ?? '', descriptionAr: item?.descriptionAr ?? '',
    branchId: item?.branchId ?? 0, parentDepartmentId: item?.parentDepartmentId ?? 0, departmentId: item?.departmentId ?? 0,
    divisionId: item?.divisionId ?? 0, jobTitleId: item?.jobTitleId ?? 0, jobLevelId: item?.jobLevelId ?? 0, positionId: item?.positionId ?? 0,
    costCenterCode: item?.costCenterCode ?? '', timeZoneId: item?.timeZoneId ?? 'UTC', openedOn: item?.openedOn ?? new Date().toISOString().slice(0, 10), email: item?.email ?? '', phone: item?.phone ?? '',
    isHeadquarters: item?.isHeadquarters ?? false, levelOrder: numberText(item?.levelOrder), minSalary: numberText(item?.minSalary), maxSalary: numberText(item?.maxSalary), currencyCode: item?.currencyCode ?? '',
    canManageOthers: item?.canManageOthers ?? false, isManagementLevel: item?.isManagementLevel ?? false, targetHeadcount: numberText(item?.targetHeadcount ?? 0), version: item?.version ?? (resource === 'job-descriptions' ? item?.code ?? '' : ''),
    purposeEn: item?.purposeEn ?? '', purposeAr: item?.purposeAr ?? '', responsibilitiesEn: item?.responsibilitiesEn ?? '', responsibilitiesAr: item?.responsibilitiesAr ?? '',
    requirementsEn: item?.requirementsEn ?? '', requirementsAr: item?.requirementsAr ?? '', requiredSkills: item?.requiredSkills ?? '', requiredEducation: item?.requiredEducation ?? '', minExperienceYears: numberText(item?.minExperienceYears),
    preferredQualificationsEn: item?.preferredQualificationsEn ?? '', preferredQualificationsAr: item?.preferredQualificationsAr ?? '', revisionNotes: item?.revisionNotes ?? '',
  }), [item, resource]);
  const { clearErrors, control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useZodForm<FormValues>(schema, { defaultValues: defaults });
  const branchId = useWatch({ control, name: 'branchId' });
  const branches = useOrganizationalLookup('branches', undefined, resource === 'departments');
  const parentDepartments = useOrganizationalLookup('departments', branchId, resource === 'departments' && branchId > 0);
  const departments = useOrganizationalLookup('departments', undefined, resource === 'divisions');
  const divisions = useOrganizationalLookup('divisions', undefined, resource === 'positions');
  const jobTitles = useOrganizationalLookup('job-titles', undefined, resource === 'positions');
  const jobLevels = useOrganizationalLookup('job-levels', undefined, resource === 'positions');
  const positions = useOrganizationalLookup('positions', undefined, resource === 'job-descriptions');
  const options = (values = [] as { id: number; code: string; nameEn: string; nameAr: string }[]) => values.map((value) => ({ value: value.id, label: `${value.code} — ${value.nameEn} (${value.nameAr})`, icon: 'business-outline' as const }));
  const disabled = readOnly || loading;
  const field = (name: keyof FormValues, label: string, props: Record<string, unknown> = {}) => <Controller control={control} name={name} render={({ field: current }) => <AppTextField editable={!disabled} label={label} name={current.name} onBlur={current.onBlur} onChangeText={current.onChange} ref={current.ref} value={String(current.value ?? '')} {...props} />} />;
  const select = (name: 'branchId' | 'parentDepartmentId' | 'departmentId' | 'divisionId' | 'jobTitleId' | 'jobLevelId' | 'positionId', label: string, values: ReturnType<typeof options>, required = true) => <Controller control={control} name={name} render={({ field: current }) => <AppSelectField disabled={disabled} label={label} leadingIcon="business-outline" name={current.name} onChange={current.onChange} options={values} placeholder={t('organizationalStructure.selectParent')} required={required} value={current.value} />} />;
  const submit = handleSubmit(async (values) => onSave({
    ...values, code: (resource === 'job-descriptions' ? values.version : values.code).trim().toUpperCase(), nameEn: values.nameEn.trim(), nameAr: values.nameAr.trim(),
    branchId: values.branchId || undefined, parentDepartmentId: values.parentDepartmentId || undefined, departmentId: values.departmentId || undefined,
    divisionId: values.divisionId || undefined, jobTitleId: values.jobTitleId || undefined, jobLevelId: values.jobLevelId || undefined, positionId: values.positionId || undefined,
    levelOrder: optionalNumber(values.levelOrder), minSalary: optionalNumber(values.minSalary), maxSalary: optionalNumber(values.maxSalary),
    targetHeadcount: optionalNumber(values.targetHeadcount), minExperienceYears: optionalNumber(values.minExperienceYears),
    version: values.version.trim() || undefined,
  }));
  return <AppForm contentContainerStyle={styles.content} errors={toFormErrorMap(errors)} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} isDirty={isDirty} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof FormValues)} onSubmit={readOnly ? undefined : submit} presentation="fullScreen" style={styles.form} submitting={loading || isSubmitting} submitLabel={t('common.save')} subtitle={t('organizationalStructure.formSubtitle')} title={t(`organizationalStructure.form.${mode}`, { resource: t(`organizationalStructure.resources.${resource}`) })} visible>
    <AppFormSection icon="pricetag-outline" title={t('organizationalStructure.identity')}>
      {field('code', t(resource === 'job-descriptions' ? 'organizationalStructure.fields.version' : 'organizationalStructure.fields.code'), { autoCapitalize: 'characters', required: true })}
      {field('nameEn', t('organizationalStructure.fields.nameEn'), { required: true })}{field('nameAr', t('organizationalStructure.fields.nameAr'), { required: true })}
    </AppFormSection>
    {resource === 'branches' ? <AppFormSection icon="business-outline" title={t('organizationalStructure.branchDetails')}>
      {field('timeZoneId', t('organizationalStructure.fields.timeZone'))}{field('openedOn', t('organizationalStructure.fields.openedOn'))}{field('email', t('organizationalStructure.fields.email'), { keyboardType: 'email-address' })}{field('phone', t('organizationalStructure.fields.phone'), { keyboardType: 'phone-pad' })}
      <Controller control={control} name="isHeadquarters" render={({ field: current }) => <AppSwitchField disabled={disabled} icon="home-outline" label={t('organizationalStructure.fields.headquarters')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
    </AppFormSection> : null}
    {resource === 'departments' ? <AppFormSection icon="git-branch-outline" title={t('organizationalStructure.parent')}>
      {select('branchId', t('organizationalStructure.resources.branches'), options(branches.data))}
      {select('parentDepartmentId', t('organizationalStructure.fields.parentDepartment'), options(parentDepartments.data?.filter((value) => value.id !== item?.id)), false)}
      {field('costCenterCode', t('organizationalStructure.fields.costCenter'))}{field('descriptionAr', t('organizationalStructure.fields.descriptionAr'), { multiline: true })}{field('descriptionEn', t('organizationalStructure.fields.descriptionEn'), { multiline: true })}
    </AppFormSection> : null}
    {resource === 'divisions' ? <AppFormSection icon="git-branch-outline" title={t('organizationalStructure.parent')}>
      {select('departmentId', t('organizationalStructure.resources.departments'), options(departments.data))}{field('costCenterCode', t('organizationalStructure.fields.costCenter'))}{field('descriptionAr', t('organizationalStructure.fields.descriptionAr'), { multiline: true })}{field('descriptionEn', t('organizationalStructure.fields.descriptionEn'), { multiline: true })}
    </AppFormSection> : null}
    {resource === 'job-levels' ? <AppFormSection icon="layers-outline" title={t('organizationalStructure.levelDetails')}>
      {field('levelOrder', t('organizationalStructure.fields.levelOrder'), { keyboardType: 'number-pad' })}{field('minSalary', t('organizationalStructure.fields.minSalary'), { keyboardType: 'decimal-pad' })}{field('maxSalary', t('organizationalStructure.fields.maxSalary'), { keyboardType: 'decimal-pad' })}{field('currencyCode', t('organizationalStructure.fields.currency'), { autoCapitalize: 'characters' })}
      <Controller control={control} name="canManageOthers" render={({ field: current }) => <AppSwitchField disabled={disabled} label={t('organizationalStructure.fields.canManageOthers')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
      <Controller control={control} name="isManagementLevel" render={({ field: current }) => <AppSwitchField disabled={disabled} label={t('organizationalStructure.fields.managementLevel')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
    </AppFormSection> : null}
    {resource === 'positions' ? <AppFormSection icon="briefcase-outline" title={t('organizationalStructure.positionDetails')}>
      {select('divisionId', t('organizationalStructure.resources.divisions'), options(divisions.data))}{select('jobTitleId', t('organizationalStructure.resources.job-titles'), options(jobTitles.data))}{select('jobLevelId', t('organizationalStructure.resources.job-levels'), options(jobLevels.data))}{field('targetHeadcount', t('organizationalStructure.fields.targetHeadcount'), { keyboardType: 'number-pad' })}
    </AppFormSection> : null}
    {resource === 'job-descriptions' ? <AppFormSection icon="document-text-outline" title={t('organizationalStructure.descriptionDetails')}>
      {select('positionId', t('organizationalStructure.resources.positions'), options(positions.data))}{field('purposeAr', t('organizationalStructure.fields.purposeAr'), { multiline: true })}{field('purposeEn', t('organizationalStructure.fields.purposeEn'), { multiline: true })}{field('responsibilitiesAr', t('organizationalStructure.fields.responsibilitiesAr'), { multiline: true })}{field('responsibilitiesEn', t('organizationalStructure.fields.responsibilitiesEn'), { multiline: true })}{field('requirementsAr', t('organizationalStructure.fields.requirementsAr'), { multiline: true })}{field('requirementsEn', t('organizationalStructure.fields.requirementsEn'), { multiline: true })}{field('requiredSkills', t('organizationalStructure.fields.requiredSkills'), { multiline: true })}{field('requiredEducation', t('organizationalStructure.fields.requiredEducation'), { multiline: true })}{field('minExperienceYears', t('organizationalStructure.fields.experienceYears'), { keyboardType: 'number-pad' })}{field('preferredQualificationsAr', t('organizationalStructure.fields.preferredQualificationsAr'), { multiline: true })}{field('preferredQualificationsEn', t('organizationalStructure.fields.preferredQualificationsEn'), { multiline: true })}{field('revisionNotes', t('organizationalStructure.fields.revisionNotes'), { multiline: true })}
    </AppFormSection> : null}
  </AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
