import { useMemo, useRef } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppSelectField, AppSwitchField, AppTextField } from '@/src/shared/components';
import { useOrganizationalLookup } from '../queries/use-organizational-structure';
import type { OrganizationalResource, OrganizationalStructureItem, OrganizationalStructureRequest } from '../types/organizational-structure';
import { createOrganizationalStructureSchema } from '../validation/organizational-structure-schema';
import { getNextOrganizationalStructureMockData, organizationalStructureMockDependenciesReady } from '../utils/organizational-structure-mock-data';
import { DutySectionsEditor } from './job-description-editors/DutySectionsEditor';
import { SkillsEditor } from './job-description-editors/SkillsEditor';
import { EducationRequirementsEditor } from './job-description-editors/EducationRequirementsEditor';

interface Props { resource: OrganizationalResource; item: OrganizationalStructureItem | null; mode: 'create' | 'edit' | 'view'; loading: boolean; onClose: () => void; onSave: (request: OrganizationalStructureRequest) => Promise<void>; }
const numberText = (value?: number) => value == null ? '' : String(value);
const optionalNumber = (value: string) => value.trim() ? Number(value) : undefined;
const createMockSuffix = () => Math.floor(Math.random() * 900 + 100);

export function OrganizationalStructureForm({ resource, item, mode, loading, onClose, onSave }: Props) {
  const { t } = useTranslation(); const readOnly = mode === 'view';
  const schema = useMemo(() => createOrganizationalStructureSchema(resource, t), [resource, t]); type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({
    code: item?.code ?? '', nameEn: item?.nameEn ?? '', nameAr: item?.nameAr ?? '', descriptionEn: item?.descriptionEn ?? '', descriptionAr: item?.descriptionAr ?? '',
    branchId: item?.branchId ?? 0, parentDepartmentId: item?.parentDepartmentId ?? 0, departmentId: item?.departmentId ?? 0,
    divisionId: item?.divisionId ?? 0, jobTitleId: item?.jobTitleId ?? 0, jobLevelId: item?.jobLevelId ?? 0, positionId: item?.positionId ?? 0,
    costCenterCode: item?.costCenterCode ?? '', timeZoneId: item?.timeZoneId ?? 'UTC', openedOn: item?.openedOn ?? new Date().toISOString().slice(0, 10), email: item?.email ?? '', phone: item?.phone ?? '',
    isHeadquarters: item?.isHeadquarters ?? false, isCentralized: item?.isCentralized ?? (resource === 'departments' ? !item?.branchId : false), levelOrder: numberText(item?.levelOrder), minSalary: numberText(item?.minSalary), maxSalary: numberText(item?.maxSalary), currencyCode: item?.currencyCode ?? '',
    canManageOthers: item?.canManageOthers ?? false, isManagementLevel: item?.isManagementLevel ?? false, targetHeadcount: numberText(item?.targetHeadcount ?? 0), version: item?.version ?? (resource === 'job-descriptions' ? item?.code ?? '' : ''),
    parentCostCenterId: item?.parentCostCenterId ?? 0, symbol: item?.symbol ?? '', exchangeRateToDefault: numberText(item?.exchangeRateToDefault ?? 1), isDefault: item?.isDefault ?? false,
    purposeEn: item?.purposeEn ?? '', purposeAr: item?.purposeAr ?? '', responsibilitiesEn: item?.responsibilitiesEn ?? '', responsibilitiesAr: item?.responsibilitiesAr ?? '',
    requirementsEn: item?.requirementsEn ?? '', requirementsAr: item?.requirementsAr ?? '', requiredSkills: item?.requiredSkills ?? '', requiredEducation: item?.requiredEducation ?? '', minExperienceYears: numberText(item?.minExperienceYears),
    preferredQualificationsEn: item?.preferredQualificationsEn ?? '', preferredQualificationsAr: item?.preferredQualificationsAr ?? '', revisionNotes: item?.revisionNotes ?? '',
    dutySections: item?.dutySections ?? [], skills: item?.skills ?? [], educationRequirements: item?.educationRequirements ?? [],
  }), [item, resource]);
  const { clearErrors, control, handleSubmit, setValue, formState: { errors, isDirty, isSubmitting } } = useZodForm<FormValues>(schema, { defaultValues: defaults });
  const branchId = useWatch({ control, name: 'branchId' });
  const isCentralized = useWatch({ control, name: 'isCentralized' });
  const dutySections = useWatch({ control, name: 'dutySections' }) ?? [];
  const skills = useWatch({ control, name: 'skills' }) ?? [];
  const educationRequirements = useWatch({ control, name: 'educationRequirements' }) ?? [];
  const branches = useOrganizationalLookup('branches', undefined, resource === 'departments');
  const parentDepartments = useOrganizationalLookup('departments', branchId || undefined, resource === 'departments');
  const departments = useOrganizationalLookup('departments', undefined, resource === 'divisions');
  const divisions = useOrganizationalLookup('divisions', undefined, resource === 'positions');
  const jobTitles = useOrganizationalLookup('job-titles', undefined, resource === 'positions');
  const jobLevels = useOrganizationalLookup('job-levels', undefined, resource === 'positions');
  const positions = useOrganizationalLookup('positions', undefined, resource === 'job-descriptions');
  const costCenters = useOrganizationalLookup('cost-centers', undefined, resource === 'departments' || resource === 'divisions' || resource === 'cost-centers');
  const currencies = useOrganizationalLookup('currencies', undefined, resource === 'job-levels');
  const usedMockIndexes = useRef(new Set<number>());
  const mockLookups = {
    branches: branches.data ?? [],
    departments: departments.data ?? [],
    divisions: divisions.data ?? [],
    'job-titles': jobTitles.data ?? [],
    'job-levels': jobLevels.data ?? [],
    positions: positions.data ?? [],
  };
  const options = (values = [] as { id: number; code: string; nameEn: string; nameAr: string }[]) => values.map((value) => ({ value: value.id, label: `${value.code} — ${value.nameEn} (${value.nameAr})`, icon: 'business-outline' as const }));
  const disabled = readOnly || loading;
  const field = (name: keyof FormValues, label: string, props: Record<string, unknown> = {}) => <Controller control={control} name={name} render={({ field: current }) => <AppTextField editable={!disabled} label={label} name={current.name} onBlur={current.onBlur} onChangeText={current.onChange} ref={current.ref} value={String(current.value ?? '')} {...props} />} />;
  const select = (name: 'branchId' | 'parentDepartmentId' | 'parentCostCenterId' | 'departmentId' | 'divisionId' | 'jobTitleId' | 'jobLevelId' | 'positionId', label: string, values: ReturnType<typeof options>, required = true) => <Controller control={control} name={name} render={({ field: current }) => <AppSelectField disabled={disabled} label={label} leadingIcon="business-outline" name={current.name} onChange={current.onChange} options={values} placeholder={t('organizationalStructure.selectParent')} required={required} value={current.value} />} />;
  const submit = handleSubmit(async (values) => onSave({
    ...values, code: (resource === 'job-descriptions' ? values.version : values.code).trim().toUpperCase(), nameEn: values.nameEn.trim(), nameAr: values.nameAr.trim(),
    branchId: values.isCentralized ? undefined : (values.branchId || undefined), parentDepartmentId: values.parentDepartmentId || undefined, departmentId: values.departmentId || undefined,
    divisionId: values.divisionId || undefined, jobTitleId: values.jobTitleId || undefined, jobLevelId: values.jobLevelId || undefined, positionId: values.positionId || undefined,
    parentCostCenterId: values.parentCostCenterId || undefined, symbol: values.symbol?.trim() || undefined, exchangeRateToDefault: optionalNumber(values.exchangeRateToDefault || ''), isDefault: values.isDefault,
    levelOrder: optionalNumber(values.levelOrder), minSalary: optionalNumber(values.minSalary), maxSalary: optionalNumber(values.maxSalary),
    targetHeadcount: optionalNumber(values.targetHeadcount), minExperienceYears: optionalNumber(values.minExperienceYears),
    version: values.version.trim() || undefined,
    dutySections: values.dutySections, skills: values.skills, educationRequirements: values.educationRequirements,
  }));
  const generateMockData = () => {
    const sample = getNextOrganizationalStructureMockData(resource, usedMockIndexes.current, mockLookups);
    const options = { shouldDirty: true, shouldValidate: true };
    setValue('code', sample.code, options);
    setValue('nameAr', sample.nameAr, options);
    setValue('nameEn', sample.nameEn, options);

    if (resource === 'branches') {
      setValue('timeZoneId', sample.timeZoneId ?? 'Africa/Cairo', options);
      setValue('openedOn', sample.openedOn ?? new Date().toISOString().slice(0, 10), options);
      setValue('email', sample.email ?? '', options);
      setValue('phone', sample.phone ?? '', options);
      setValue('isHeadquarters', sample.isHeadquarters ?? false, options);
    }
    if (resource === 'departments') {
      setValue('branchId', sample.branchId ?? 0, options);
      setValue('parentDepartmentId', sample.parentDepartmentId ?? 0, options);
      setValue('costCenterCode', sample.costCenterCode ?? '', options);
      setValue('descriptionAr', sample.descriptionAr ?? '', options);
      setValue('descriptionEn', sample.descriptionEn ?? '', options);
    }
    if (resource === 'divisions') {
      setValue('departmentId', sample.departmentId ?? 0, options);
      setValue('costCenterCode', sample.costCenterCode ?? '', options);
      setValue('descriptionAr', sample.descriptionAr ?? '', options);
      setValue('descriptionEn', sample.descriptionEn ?? '', options);
    }
    if (resource === 'job-levels') {
      setValue('levelOrder', String(sample.levelOrder ?? 0), options);
      setValue('minSalary', String(sample.minSalary ?? 0), options);
      setValue('maxSalary', String(sample.maxSalary ?? 0), options);
      setValue('currencyCode', sample.currencyCode ?? 'EGP', options);
      setValue('canManageOthers', sample.canManageOthers ?? false, options);
      setValue('isManagementLevel', sample.isManagementLevel ?? false, options);
      setValue('descriptionAr', sample.descriptionAr ?? '', options);
      setValue('descriptionEn', sample.descriptionEn ?? '', options);
    }
    if (resource === 'positions') {
      setValue('divisionId', sample.divisionId ?? 0, options);
      setValue('jobTitleId', sample.jobTitleId ?? 0, options);
      setValue('jobLevelId', sample.jobLevelId ?? 0, options);
      setValue('targetHeadcount', String(sample.targetHeadcount ?? 0), options);
    }
    if (resource === 'job-descriptions') {
      const suffix = createMockSuffix();
      setValue('code', `${sample.version ?? sample.code}.${suffix}`, options);
      setValue('version', `${sample.version ?? sample.code}.${suffix}`, options);
      setValue('nameAr', `${sample.nameAr} (${suffix})`, options);
      setValue('nameEn', `${sample.nameEn} (${suffix})`, options);
      setValue('positionId', sample.positionId ?? 0, options);
      setValue('purposeAr', sample.purposeAr ?? '', options);
      setValue('purposeEn', sample.purposeEn ?? '', options);
      setValue('dutySections', [
        {
          sectionTitleAr: 'المهام الإدارية والقيادية',
          sectionTitleEn: 'Administrative & Leadership Duties',
          weightPercentage: 40,
          items: [{ textAr: 'توجيه الفريق ومتابعة الأداء', textEn: 'Guide team and monitor performance', order: 1 }],
        },
      ], options);
      setValue('skills', [
        { skillName: 'Problem Solving', proficiencyLevel: 'Advanced', isMandatory: true },
      ], options);
      setValue('educationRequirements', [
        { degreeLevel: "Bachelor's Degree", fieldOfStudy: 'Relevant Field', isRequired: true },
      ], options);
      setValue('minExperienceYears', String(sample.minExperienceYears ?? 0), options);
      setValue('preferredQualificationsAr', sample.preferredQualificationsAr ?? '', options);
      setValue('preferredQualificationsEn', sample.preferredQualificationsEn ?? '', options);
      setValue('revisionNotes', sample.revisionNotes ?? '', options);
    }
  };
  return <AppForm contentContainerStyle={styles.content} errors={toFormErrorMap(errors)} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} isDirty={isDirty} mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled: loading || !organizationalStructureMockDependenciesReady(resource, mockLookups) } : undefined} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof FormValues)} onSubmit={readOnly ? undefined : submit} presentation="fullScreen" style={styles.form} submitting={loading || isSubmitting} submitLabel={t('common.save')} subtitle={t('organizationalStructure.formSubtitle')} title={t(`organizationalStructure.form.${mode}`, { resource: t(`organizationalStructure.resources.${resource}`) })} visible>
    <AppFormSection icon="pricetag-outline" title={t('organizationalStructure.identity')}>
      {field('code', t(resource === 'job-descriptions' ? 'organizationalStructure.fields.version' : 'organizationalStructure.fields.code'), { autoCapitalize: 'characters', required: true })}
      {field('nameEn', t('organizationalStructure.fields.nameEn'), { required: true })}{field('nameAr', t('organizationalStructure.fields.nameAr'), { required: true })}
    </AppFormSection>
    {resource === 'branches' ? <AppFormSection icon="business-outline" title={t('organizationalStructure.branchDetails')}>
      {field('timeZoneId', t('organizationalStructure.fields.timeZone'))}{field('openedOn', t('organizationalStructure.fields.openedOn'))}{field('email', t('organizationalStructure.fields.email'), { keyboardType: 'email-address' })}{field('phone', t('organizationalStructure.fields.phone'), { keyboardType: 'phone-pad' })}
      <Controller control={control} name="isHeadquarters" render={({ field: current }) => <AppSwitchField disabled={disabled} icon="home-outline" label={t('organizationalStructure.fields.headquarters')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
    </AppFormSection> : null}
    {resource === 'departments' ? <AppFormSection icon="git-branch-outline" title={t('organizationalStructure.parent')}>
      <Controller
        control={control}
        name="isCentralized"
        render={({ field: current }) => (
          <AppSwitchField
            disabled={disabled}
            icon="business-outline"
            label={t('organizationalStructure.fields.isCentralized')}
            name={current.name}
            onValueChange={(val) => {
              current.onChange(val);
              if (val) {
                setValue('branchId', 0, { shouldValidate: true, shouldDirty: true });
              }
            }}
            value={Boolean(current.value)}
          />
        )}
      />
      {!isCentralized ? select('branchId', t('organizationalStructure.resources.branches'), options(branches.data), true) : null}
      {select('parentDepartmentId', t('organizationalStructure.fields.parentDepartment'), options(parentDepartments.data?.filter((value) => value.id !== item?.id)), false)}
      {costCenters.data && costCenters.data.length > 0 ? (
        <Controller control={control} name="costCenterCode" render={({ field: current }) => <AppSelectField disabled={disabled} label={t('organizationalStructure.fields.costCenter')} leadingIcon="business-outline" name={current.name} onChange={(v) => current.onChange(String(v))} options={costCenters.data.map(cc => ({ value: cc.code, label: `${cc.code} — ${cc.nameEn} (${cc.nameAr})`, icon: 'business-outline' as const }))} placeholder={t('organizationalStructure.fields.costCenter')} required={false} value={current.value} />} />
      ) : field('costCenterCode', t('organizationalStructure.fields.costCenter'))}
      {field('descriptionAr', t('organizationalStructure.fields.descriptionAr'), { multiline: true })}{field('descriptionEn', t('organizationalStructure.fields.descriptionEn'), { multiline: true })}
    </AppFormSection> : null}
    {resource === 'divisions' ? <AppFormSection icon="git-branch-outline" title={t('organizationalStructure.parent')}>
      {select('departmentId', t('organizationalStructure.resources.departments'), options(departments.data))}
      {costCenters.data && costCenters.data.length > 0 ? (
        <Controller control={control} name="costCenterCode" render={({ field: current }) => <AppSelectField disabled={disabled} label={t('organizationalStructure.fields.costCenter')} leadingIcon="business-outline" name={current.name} onChange={(v) => current.onChange(String(v))} options={costCenters.data.map(cc => ({ value: cc.code, label: `${cc.code} — ${cc.nameEn} (${cc.nameAr})`, icon: 'business-outline' as const }))} placeholder={t('organizationalStructure.fields.costCenter')} required={false} value={current.value} />} />
      ) : field('costCenterCode', t('organizationalStructure.fields.costCenter'))}
      {field('descriptionAr', t('organizationalStructure.fields.descriptionAr'), { multiline: true })}{field('descriptionEn', t('organizationalStructure.fields.descriptionEn'), { multiline: true })}
    </AppFormSection> : null}
    {resource === 'cost-centers' ? <AppFormSection icon="git-branch-outline" title={t('organizationalStructure.parent')}>
      {select('parentCostCenterId', t('organizationalStructure.fields.parentCostCenter'), options(costCenters.data?.filter((val) => val.id !== item?.id)), false)}
      {field('descriptionAr', t('organizationalStructure.fields.descriptionAr'), { multiline: true })}{field('descriptionEn', t('organizationalStructure.fields.descriptionEn'), { multiline: true })}
    </AppFormSection> : null}
    {resource === 'currencies' ? <AppFormSection icon="cash-outline" title={t('organizationalStructure.resources.currencies')}>
      {field('symbol', t('organizationalStructure.fields.symbol'))}
      {field('exchangeRateToDefault', t('organizationalStructure.fields.exchangeRate'), { keyboardType: 'decimal-pad' })}
      <Controller control={control} name="isDefault" render={({ field: current }) => <AppSwitchField disabled={disabled} label={t('organizationalStructure.fields.defaultCurrency')} name={current.name} onValueChange={current.onChange} value={Boolean(current.value)} />} />
    </AppFormSection> : null}
    {resource === 'job-levels' ? <AppFormSection icon="layers-outline" title={t('organizationalStructure.levelDetails')}>
      {field('levelOrder', t('organizationalStructure.fields.levelOrder'), { keyboardType: 'number-pad' })}{field('minSalary', t('organizationalStructure.fields.minSalary'), { keyboardType: 'decimal-pad' })}{field('maxSalary', t('organizationalStructure.fields.maxSalary'), { keyboardType: 'decimal-pad' })}
      {currencies.data && currencies.data.length > 0 ? (
        <Controller control={control} name="currencyCode" render={({ field: current }) => <AppSelectField disabled={disabled} label={t('organizationalStructure.fields.currency')} leadingIcon="cash-outline" name={current.name} onChange={(v) => current.onChange(String(v))} options={currencies.data.map(c => ({ value: c.code, label: `${c.code} — ${c.nameEn} (${c.nameAr})`, icon: 'cash-outline' as const }))} placeholder={t('organizationalStructure.fields.currency')} required={false} value={current.value} />} />
      ) : field('currencyCode', t('organizationalStructure.fields.currency'), { autoCapitalize: 'characters' })}
      <Controller control={control} name="canManageOthers" render={({ field: current }) => <AppSwitchField disabled={disabled} label={t('organizationalStructure.fields.canManageOthers')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
      <Controller control={control} name="isManagementLevel" render={({ field: current }) => <AppSwitchField disabled={disabled} label={t('organizationalStructure.fields.managementLevel')} name={current.name} onValueChange={current.onChange} value={current.value} />} />
    </AppFormSection> : null}
    {resource === 'positions' ? <AppFormSection icon="briefcase-outline" title={t('organizationalStructure.positionDetails')}>
      {select('divisionId', t('organizationalStructure.resources.divisions'), options(divisions.data))}{select('jobTitleId', t('organizationalStructure.resources.job-titles'), options(jobTitles.data))}{select('jobLevelId', t('organizationalStructure.resources.job-levels'), options(jobLevels.data))}{field('targetHeadcount', t('organizationalStructure.fields.targetHeadcount'), { keyboardType: 'number-pad' })}
    </AppFormSection> : null}
    {resource === 'job-descriptions' ? <AppFormSection icon="document-text-outline" title={t('organizationalStructure.descriptionDetails')}>
      {select('positionId', t('organizationalStructure.resources.positions'), options(positions.data))}
      {field('purposeAr', t('organizationalStructure.fields.purposeAr'), { multiline: true })}
      {field('purposeEn', t('organizationalStructure.fields.purposeEn'), { multiline: true })}
      <DutySectionsEditor
        disabled={disabled}
        onChange={(val) => setValue('dutySections', val, { shouldDirty: true, shouldValidate: true })}
        sections={dutySections}
      />
      <SkillsEditor
        disabled={disabled}
        onChange={(val) => setValue('skills', val, { shouldDirty: true, shouldValidate: true })}
        skills={skills}
      />
      <EducationRequirementsEditor
        disabled={disabled}
        onChange={(val) => setValue('educationRequirements', val, { shouldDirty: true, shouldValidate: true })}
        requirements={educationRequirements}
      />
      {field('minExperienceYears', t('organizationalStructure.fields.experienceYears'), { keyboardType: 'number-pad' })}
      {field('preferredQualificationsAr', t('organizationalStructure.fields.preferredQualificationsAr'), { multiline: true })}
      {field('preferredQualificationsEn', t('organizationalStructure.fields.preferredQualificationsEn'), { multiline: true })}
      {field('revisionNotes', t('organizationalStructure.fields.revisionNotes'), { multiline: true })}
    </AppFormSection> : null}
  </AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
