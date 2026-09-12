import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useWatch, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { useFiscalYear, useFiscalYearLookup } from '@/src/modules/hr/finance';
import { useOrganizationalLookup } from '@/src/modules/hr/basic-data';
import { AppButton, AppCard, AppForm, AppFormSection, AppIconButton, AppSelectField, AppStatusBadge, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';
import { createWorkforcePlanSchema } from '../validation/workforce-plan-schema';
import type { WorkforcePlanDraftSyncStatus } from '../../domain/models/workforce-plan-draft';
import type { UpdateWorkforcePlanRequest, WorkforcePlanDetail, WorkforcePlanLine, WorkforcePlanRequest } from '../../domain/models/workforce-plan';

type Values = z.infer<ReturnType<typeof createWorkforcePlanSchema>>;
interface Props { item: WorkforcePlanDetail | null; revisions: WorkforcePlanDetail[]; mode: 'create' | 'edit' | 'view'; loading: boolean; detailLoading?: boolean; detailError?: string | null; draftRequest?: UpdateWorkforcePlanRequest | null; draftStatus?: WorkforcePlanDraftSyncStatus | null; onDiscardDraft?: () => void; onRetryDetail?: () => void; onClose: () => void; onSave: (request: WorkforcePlanRequest) => Promise<void>; }
const emptyPeriod = () => ({ fiscalPeriodId: 0, newHireSlots: 0, replacementSlots: 0 });
const emptyLine = () => ({ positionId: 0, targetBranchId: null as number | null, newHireSlots: 0, replacementSlots: 0, justification: '', periodTargets: [emptyPeriod()] });
const emptyValues = (): Values => ({ planCode: '', fiscalYearId: 0, titleEn: '', titleAr: '', description: '', lines: [emptyLine()] });
const valuesFrom = (item: WorkforcePlanDetail | null, draftRequest?: UpdateWorkforcePlanRequest | null): Values => {
  if (item && draftRequest) return {
    planCode: item.planCode,
    fiscalYearId: item.fiscalYearId,
    titleEn: draftRequest.titleEn,
    titleAr: draftRequest.titleAr,
    description: draftRequest.description ?? '',
    lines: draftRequest.lines.map(line => ({ ...line, justification: line.justification ?? '' })),
  };
  return item ? ({
    planCode: item.planCode, fiscalYearId: item.fiscalYearId, titleEn: item.titleEn, titleAr: item.titleAr, description: item.description ?? '',
    lines: item.lines.map(line => ({ positionId: line.positionId, targetBranchId: line.targetBranchId, newHireSlots: line.newHireSlots, replacementSlots: line.replacementSlots, justification: line.justification ?? '', periodTargets: line.periodTargets.map(target => ({ fiscalPeriodId: target.fiscalPeriodId, newHireSlots: target.newHireSlots, replacementSlots: target.replacementSlots })) })),
  }) : emptyValues();
};

function NumberField({ control, name, label, disabled }: { control: Control<Values>; name: FieldPath<Values>; label: string; disabled: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <AppTextField name={field.name} label={label} value={field.value === null || field.value === undefined ? '' : String(field.value)} onChangeText={value => field.onChange(value === '' ? 0 : Number(value))} onBlur={field.onBlur} editable={!disabled} keyboardType="numeric" numeric error={fieldState.error?.message} />} />;
}

function LineFields({ control, index, disabled, positions, branches, periods: periodOptions, original }: { control: Control<Values>; index: number; disabled: boolean; positions: AppSelectOption<number>[]; branches: AppSelectOption<number>[]; periods: AppSelectOption<number>[]; original?: WorkforcePlanLine }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const periods = useFieldArray({ control, name: `lines.${index}.periodTargets` as const });
  const newHireSlots = Number(useWatch({ control, name: `lines.${index}.newHireSlots` as const }) ?? 0);
  const replacementSlots = Number(useWatch({ control, name: `lines.${index}.replacementSlots` as const }) ?? 0);
  return <AppCard padding="sm" variant="outlined">
    <AppText weight="700">{t('workforcePlanning.lines.item', { number: index + 1 })}</AppText>
    <Controller control={control} name={`lines.${index}.positionId`} render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforcePlanning.fields.position')} options={positions} value={field.value} onChange={field.onChange} disabled={disabled} required error={fieldState.error?.message} leadingIcon="briefcase-outline" />} />
    <Controller control={control} name={`lines.${index}.targetBranchId`} render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforcePlanning.fields.targetBranch')} options={branches} value={field.value ?? 0} onChange={value => field.onChange(value || null)} disabled={disabled} error={fieldState.error?.message} helperText={t('workforcePlanning.form.branchHelper')} leadingIcon="business-outline" />} />
    <NumberField control={control} name={`lines.${index}.newHireSlots`} label={t('workforcePlanning.fields.newHireSlots')} disabled={disabled} />
    <NumberField control={control} name={`lines.${index}.replacementSlots`} label={t('workforcePlanning.fields.replacementSlots')} disabled={disabled} />
    <View style={styles.badges}>
      {original ? <AppStatusBadge color={theme.colors.primary} label={t('workforcePlanning.summary.currentEmployees', { count: original.baselineHeadcount })} /> : <AppStatusBadge color={theme.colors.textMuted} label={t('workforcePlanning.summary.baselineOnSave')} />}
      {original ? <AppStatusBadge color={theme.colors.success} label={t('workforcePlanning.summary.expectedEmployees', { count: original.baselineHeadcount + newHireSlots })} /> : null}
      <AppStatusBadge color={theme.colors.primary} label={t('workforcePlanning.summary.totalHiring', { count: newHireSlots + replacementSlots })} />
      {original ? <AppStatusBadge color={theme.colors.textMuted} label={t('workforcePlanning.baseline.asOf', { date: original.baselineAsOfDate })} /> : null}
    </View>
    <Controller control={control} name={`lines.${index}.justification`} render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforcePlanning.fields.justification')} value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} error={fieldState.error?.message} multiline />} />
    <AppText weight="700">{t('workforcePlanning.periodTargets.title')}</AppText>
    {periods.fields.map((period, periodIndex) => <View key={period.id} style={styles.period}>
      <Controller control={control} name={`lines.${index}.periodTargets.${periodIndex}.fiscalPeriodId`} render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforcePlanning.fields.fiscalPeriod')} options={periodOptions} value={field.value} onChange={field.onChange} disabled={disabled} required error={fieldState.error?.message} leadingIcon="calendar-outline" />} />
      <NumberField control={control} name={`lines.${index}.periodTargets.${periodIndex}.newHireSlots`} label={t('workforcePlanning.fields.newHireSlots')} disabled={disabled} />
      <NumberField control={control} name={`lines.${index}.periodTargets.${periodIndex}.replacementSlots`} label={t('workforcePlanning.fields.replacementSlots')} disabled={disabled} />
      {!disabled ? <View style={styles.actions}><AppIconButton icon="arrow-up-outline" label={t('workforcePlanning.actions.moveUp')} disabled={periodIndex === 0} onPress={() => periods.move(periodIndex, periodIndex - 1)} /><AppIconButton icon="arrow-down-outline" label={t('workforcePlanning.actions.moveDown')} disabled={periodIndex === periods.fields.length - 1} onPress={() => periods.move(periodIndex, periodIndex + 1)} /><AppIconButton icon="trash-outline" label={t('actions.remove')} disabled={periods.fields.length === 1} onPress={() => periods.remove(periodIndex)} /></View> : null}
    </View>)}
    {!disabled ? <AppButton variant="ghost" onPress={() => periods.append(emptyPeriod())}>{t('workforcePlanning.periodTargets.add')}</AppButton> : null}
  </AppCard>;
}

export function WorkforcePlanForm({ item, revisions, mode, loading, detailLoading = false, detailError, draftRequest, draftStatus, onDiscardDraft, onRetryDetail, onClose, onSave }: Props) {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme(); const readOnly = mode === 'view'; const disabled = readOnly || loading || detailLoading;
  const schema = useMemo(() => createWorkforcePlanSchema(t), [t]);
  const form = useZodForm<Values>(schema, { defaultValues: valuesFrom(item, draftRequest) });
  const lines = useFieldArray({ control: form.control, name: 'lines' });
  const fiscalYearId = useWatch({ control: form.control, name: 'fiscalYearId' });
  const fiscalYears = useFiscalYearLookup();
  const positionsLookup = useOrganizationalLookup('positions', undefined, true);
  const branchesLookup = useOrganizationalLookup('branches', undefined, true);
  const fallbackFiscalYearId = fiscalYears.data?.find(year => year.status === 2)?.id ?? fiscalYears.data?.find(year => year.status === 1)?.id ?? 0;
  const fiscalYear = useFiscalYear(fiscalYearId || fallbackFiscalYearId || null, Boolean(fiscalYearId || fallbackFiscalYearId));
  const isArabic = i18n.language.startsWith('ar');
  const options = (values: { id: number; code: string; nameEn: string; nameAr: string }[], icon: AppSelectOption<number>['icon']) => values.map(value => ({ value: value.id, label: `${value.code} — ${isArabic ? value.nameAr : value.nameEn}`, icon }));
  const fiscalOptions = options(fiscalYears.data ?? [], 'calendar-outline');
  const positionOptions = options(positionsLookup.data ?? [], 'briefcase-outline');
  const branchOptions: AppSelectOption<number>[] = [{ value: 0, label: t('workforcePlanning.form.noBranch'), icon: 'business-outline' }, ...options(branchesLookup.data ?? [], 'business-outline')];
  const periodOptions: AppSelectOption<number>[] = (fiscalYear.data?.periods ?? []).map(period => ({ value: period.id, label: `${period.code} — ${isArabic ? period.nameAr : period.nameEn}`, icon: 'calendar-outline' }));
  useEffect(() => { form.reset(valuesFrom(item, draftRequest)); }, [draftRequest, form, item, mode]);
  const generateMockData = () => {
    const fiscalId = fiscalYearId || fallbackFiscalYearId; const periods = fiscalYear.data?.periods ?? []; const position = positionsLookup.data?.[0];
    if (!fiscalId || !position || !periods.length) return;
    const next = { shouldDirty: true, shouldValidate: true };
    form.setValue('planCode', `WP-${new Date().getFullYear() + 1}`, next); form.setValue('fiscalYearId', fiscalId, next);
    form.setValue('titleEn', 'Annual workforce growth plan', next); form.setValue('titleAr', 'خطة نمو القوى العاملة السنوية', next); form.setValue('description', 'Planned hiring demand distributed across fiscal periods.', next);
    form.setValue('lines', [{ positionId: position.id, targetBranchId: branchesLookup.data?.[0]?.id ?? null, newHireSlots: periods.length, replacementSlots: 0, justification: 'Capacity growth', periodTargets: periods.map(period => ({ fiscalPeriodId: period.id, newHireSlots: 1, replacementSlots: 0 })) }], next);
  };
  const save = form.handleSubmit(values => onSave({ ...values, description: values.description || null, lines: values.lines.map(line => ({ ...line, justification: line.justification || null })) }));
  const totalSlots = (plan: WorkforcePlanDetail) => plan.lines.reduce((sum, line) => sum + line.plannedHiringSlots, 0);
  const previous = revisions.find(revision => revision.revisionNumber === (item?.revisionNumber ?? 1) - 1);
  return <AppForm visible presentation="fullScreen" title={t(`workforcePlanning.form.${mode}Title`)} subtitle={t('workforcePlanning.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} serverError={detailError} onCancel={onClose} onSubmit={readOnly ? undefined : save} submitLabel={t(mode === 'edit' ? 'common.save' : 'common.create')} contentContainerStyle={styles.content} footer={detailError && onRetryDetail ? <AppButton variant="outline" onPress={onRetryDetail}>{t('common.retry')}</AppButton> : undefined} mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled: disabled || !fallbackFiscalYearId || !positionsLookup.data?.length || !fiscalYear.data?.periods.length } : undefined}>
    {draftStatus ? <AppFormSection title={t('workforcePlanning.offline.title')} icon="cloud-offline-outline">
      <AppStatusBadge color={draftStatus === 'conflict' ? theme.colors.danger : draftStatus === 'uncertain' ? theme.colors.warning : theme.colors.primary} label={t(`workforcePlanning.offline.${draftStatus}`)} />
      {onDiscardDraft && ['conflict', 'uncertain'].includes(draftStatus) ? <AppButton variant="outline" onPress={onDiscardDraft}>{t('workforcePlanning.offline.discard')}</AppButton> : null}
    </AppFormSection> : null}
    <AppFormSection title={t('workforcePlanning.form.identity')} icon="document-text-outline">
      <Controller control={form.control} name="planCode" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforcePlanning.fields.planCode')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled && mode === 'create'} error={fieldState.error?.message} required />} />
      <Controller control={form.control} name="fiscalYearId" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforcePlanning.fields.fiscalYear')} options={fiscalOptions} value={field.value} onChange={field.onChange} disabled={disabled || mode !== 'create'} required error={fieldState.error?.message} leadingIcon="calendar-outline" />} />
      <Controller control={form.control} name="titleEn" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforcePlanning.fields.titleEn')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} error={fieldState.error?.message} required />} />
      <Controller control={form.control} name="titleAr" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforcePlanning.fields.titleAr')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} error={fieldState.error?.message} required />} />
      <Controller control={form.control} name="description" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforcePlanning.fields.description')} value={field.value ?? ''} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled} error={fieldState.error?.message} multiline />} />
    </AppFormSection>
    <AppFormSection title={t('workforcePlanning.lines.title')} icon="list-outline">
      {lines.fields.map((line, index) => <View key={line.id} style={styles.line}><LineFields control={form.control} index={index} disabled={disabled} positions={positionOptions} branches={branchOptions} periods={periodOptions} original={item?.lines[index]} />{!disabled ? <View style={styles.actions}><AppIconButton icon="arrow-up-outline" label={t('workforcePlanning.actions.moveUp')} disabled={index === 0} onPress={() => lines.move(index, index - 1)} /><AppIconButton icon="arrow-down-outline" label={t('workforcePlanning.actions.moveDown')} disabled={index === lines.fields.length - 1} onPress={() => lines.move(index, index + 1)} /><AppIconButton icon="trash-outline" label={t('actions.remove')} disabled={lines.fields.length === 1} onPress={() => lines.remove(index)} /></View> : null}</View>)}
      {!disabled ? <AppButton variant="secondary" onPress={() => lines.append(emptyLine())}>{t('workforcePlanning.lines.add')}</AppButton> : null}
    </AppFormSection>
    {readOnly ? <AppFormSection title={t('workforcePlanning.revisions.title')} icon="git-compare-outline">
      {revisions.map(revision => <AppCard key={revision.id} padding="sm" variant={revision.id === item?.id ? 'filled' : 'outlined'}><AppText weight="700">{t('workforcePlanning.revisions.item', { revision: revision.revisionNumber, slots: totalSlots(revision) })}</AppText><AppStatusBadge color={revision.id === item?.id ? theme.colors.primary : theme.colors.textMuted} label={t(`workforcePlanning.status.${['', 'draft', 'submitted', 'underReview', 'approved', 'rejected', 'superseded'][revision.status]}`)} /></AppCard>)}
      {previous && item ? <AppText color="muted">{t('workforcePlanning.revisions.delta', { revision: previous.revisionNumber, count: totalSlots(item) - totalSlots(previous) })}</AppText> : null}
    </AppFormSection> : null}
  </AppForm>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24, gap: 12 }, line: { gap: 8 }, period: { gap: 6 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }, badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' } });
