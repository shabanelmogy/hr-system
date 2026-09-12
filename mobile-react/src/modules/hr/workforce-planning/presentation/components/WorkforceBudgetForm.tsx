import { useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useWatch, type Control, type FieldPath } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppButton, AppCard, AppForm, AppFormSection, AppIconButton, AppSelectField, AppStatusBadge, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { useAppTheme } from '@/src/core/theme';
import { createWorkforceBudgetSchema } from '../validation/workforce-budget-schema';
import { useBudgetSourcePlan, useBudgetSourcePlans } from '../queries/use-workforce-budgets';
import type { BudgetSourcePlan, WorkforceBudgetDetail, WorkforceBudgetRequest } from '../../domain/models/workforce-budget';

type Values = z.infer<ReturnType<typeof createWorkforceBudgetSchema>>;
interface Props { item: WorkforceBudgetDetail | null; mode: 'create' | 'edit' | 'view'; loading: boolean; detailLoading?: boolean; detailError?: string | null; onRetryDetail?: () => void; onClose: () => void; onSave: (request: WorkforceBudgetRequest) => Promise<void>; }
const emptyAllocation = () => ({ fiscalPeriodId: 0, targetHeadcount: 0, allocatedSalaryCost: 0, allocatedRecruitmentCost: 0 });
const emptyValues = (): Values => ({ budgetCode: '', workforcePlanId: 0, currencyCode: 'EGP', lines: [] });

function NumberField({ control, name, label, disabled }: { control: Control<Values>; name: FieldPath<Values>; label: string; disabled: boolean }) {
  return <Controller control={control} name={name} render={({ field, fieldState }) => <AppTextField name={field.name} label={label} value={field.value === null || field.value === undefined ? '' : String(field.value)} onChangeText={value => field.onChange(value === '' ? 0 : Number(value))} onBlur={field.onBlur} editable={!disabled} keyboardType="numeric" numeric error={fieldState.error?.message} />} />;
}

function AllocationFields({ control, index, disabled, periods: periodOptions, currency }: { control: Control<Values>; index: number; disabled: boolean; periods: AppSelectOption<number>[]; currency: string }) {
  const { t } = useTranslation(); const { theme } = useAppTheme();
  const allocations = useFieldArray({ control, name: `lines.${index}.periodAllocations` as const });
  const authorizedHeadcount = Number(useWatch({ control, name: `lines.${index}.authorizedHeadcount` as const }) ?? 0);
  const salaryBudget = Number(useWatch({ control, name: `lines.${index}.allocatedSalaryBudget` as const }) ?? 0);
  const recruitmentBudget = Number(useWatch({ control, name: `lines.${index}.allocatedRecruitmentBudget` as const }) ?? 0);
  const rows = useWatch({ control, name: `lines.${index}.periodAllocations` as const }) ?? [];
  const headcountSum = rows.reduce((sum, row) => sum + Number(row.targetHeadcount ?? 0), 0);
  const salarySum = rows.reduce((sum, row) => sum + Number(row.allocatedSalaryCost ?? 0), 0);
  const recruitmentSum = rows.reduce((sum, row) => sum + Number(row.allocatedRecruitmentCost ?? 0), 0);
  return <View style={styles.block}>
    <AppText weight="700">{t('workforceBudget.allocations.title')}</AppText>
    <View style={styles.badges}>
      <AppStatusBadge color={headcountSum === authorizedHeadcount ? theme.colors.success : theme.colors.warning} label={t('workforceBudget.sums.headcount', { sum: headcountSum, total: authorizedHeadcount })} />
      <AppStatusBadge color={Math.abs(salarySum - salaryBudget) < 0.005 ? theme.colors.success : theme.colors.warning} label={t('workforceBudget.sums.salary', { sum: salarySum, total: salaryBudget, currency })} />
      <AppStatusBadge color={Math.abs(recruitmentSum - recruitmentBudget) < 0.005 ? theme.colors.success : theme.colors.warning} label={t('workforceBudget.sums.recruitment', { sum: recruitmentSum, total: recruitmentBudget, currency })} />
    </View>
    {allocations.fields.map((allocation, allocationIndex) => <View key={allocation.id} style={styles.period}>
      <Controller control={control} name={`lines.${index}.periodAllocations.${allocationIndex}.fiscalPeriodId`} render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforceBudget.fields.fiscalPeriod')} options={periodOptions} value={field.value} onChange={field.onChange} disabled={disabled} required error={fieldState.error?.message} leadingIcon="calendar-outline" />} />
      <NumberField control={control} name={`lines.${index}.periodAllocations.${allocationIndex}.targetHeadcount`} label={t('workforceBudget.fields.headcount')} disabled={disabled} />
      <NumberField control={control} name={`lines.${index}.periodAllocations.${allocationIndex}.allocatedSalaryCost`} label={t('workforceBudget.fields.salary')} disabled={disabled} />
      <NumberField control={control} name={`lines.${index}.periodAllocations.${allocationIndex}.allocatedRecruitmentCost`} label={t('workforceBudget.fields.recruitment')} disabled={disabled} />
      {!disabled ? <View style={styles.actions}><AppIconButton icon="trash-outline" label={t('actions.remove')} disabled={allocations.fields.length === 1} onPress={() => allocations.remove(allocationIndex)} /></View> : null}
    </View>)}
    {!disabled ? <AppButton variant="ghost" onPress={() => allocations.append(emptyAllocation())}>{t('workforceBudget.allocations.add')}</AppButton> : null}
  </View>;
}

export function WorkforceBudgetForm({ item, mode, loading, detailLoading = false, detailError, onRetryDetail, onClose, onSave }: Props) {
  const { t, i18n } = useTranslation(); const { theme } = useAppTheme(); const readOnly = mode === 'view'; const disabled = readOnly || loading || detailLoading;
  const schema = useMemo(() => createWorkforceBudgetSchema(t), [t]);
  const form = useZodForm<Values>(schema, { defaultValues: emptyValues() });
  const planId = useWatch({ control: form.control, name: 'workforcePlanId' });
  const currency = useWatch({ control: form.control, name: 'currencyCode' }) || 'EGP';
  const isArabic = i18n.language.startsWith('ar');
  const sourcePlans = useBudgetSourcePlans({ pageNumber: 1, pageSize: 50 }, mode === 'create');
  const sourcePlan = useBudgetSourcePlan(mode === 'create' ? Number(planId) || null : null, mode === 'create' && Boolean(planId));
  const activePlan: BudgetSourcePlan | null = useMemo(() => {
    if (mode !== 'create') return null;
    if (sourcePlan.data) return sourcePlan.data;
    return (sourcePlans.data?.items ?? []).find(plan => plan.id === Number(planId)) ?? null;
  }, [mode, sourcePlan.data, sourcePlans.data, planId]);
  const planOptions: AppSelectOption<number>[] = useMemo(() => (sourcePlans.data?.items ?? []).map(plan => ({ value: plan.id, label: `${plan.planCode} — ${isArabic ? plan.titleAr : plan.titleEn}`, icon: 'document-text-outline' })), [sourcePlans.data, isArabic]);
  const periodOptions: AppSelectOption<number>[] = useMemo(() => (activePlan?.fiscalPeriodIds ?? []).map(id => ({ value: id, label: `${t('workforceBudget.fields.fiscalPeriod')} ${id}`, icon: 'calendar-outline' })), [activePlan, t]);

  useEffect(() => {
    if (mode === 'create' && activePlan && Number(planId) === activePlan.id) {
      form.reset({
        budgetCode: form.getValues('budgetCode'),
        workforcePlanId: activePlan.id,
        currencyCode: form.getValues('currencyCode') || 'EGP',
        lines: activePlan.lines.map(planLine => ({
          workforcePlanLineId: planLine.id,
          authorizedHeadcount: planLine.plannedHiringSlots,
          allocatedSalaryBudget: 0,
          allocatedRecruitmentBudget: 0,
          periodAllocations: planLine.periodTargets.map(target => ({ fiscalPeriodId: target.fiscalPeriodId, targetHeadcount: target.newHireSlots + target.replacementSlots, allocatedSalaryCost: 0, allocatedRecruitmentCost: 0 })),
        })),
      });
    } else if (mode !== 'create' && item) {
      form.reset({
        budgetCode: item.budgetCode,
        workforcePlanId: item.workforcePlanId,
        currencyCode: item.currencyCode,
        lines: item.lines.map(line => ({
          workforcePlanLineId: line.workforcePlanLineId,
          authorizedHeadcount: line.authorizedHeadcount,
          allocatedSalaryBudget: line.allocatedSalaryBudget,
          allocatedRecruitmentBudget: line.allocatedRecruitmentBudget,
          periodAllocations: line.periodAllocations.map(allocation => ({ fiscalPeriodId: allocation.fiscalPeriodId, targetHeadcount: allocation.targetHeadcount, allocatedSalaryCost: allocation.allocatedSalaryCost, allocatedRecruitmentCost: allocation.allocatedRecruitmentCost })),
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, item?.id, activePlan?.id]);

  const generateMockData = () => {
    const plan = activePlan;
    if (!plan || !plan.lines.length) return;
    const next = { shouldDirty: true, shouldValidate: true };
    form.setValue('budgetCode', `WB-${new Date().getFullYear() + 1}-001`, next);
    form.setValue('workforcePlanId', plan.id, next);
    form.setValue('currencyCode', 'EGP', next);
    form.setValue('lines', plan.lines.map((planLine, lineIndex) => {
      const salaryPerSlot = 60000 * (lineIndex + 1);
      const recruitmentPerSlot = 5000 * (lineIndex + 1);
      const salaryTotal = salaryPerSlot * planLine.plannedHiringSlots;
      const recruitmentTotal = recruitmentPerSlot * planLine.plannedHiringSlots;
      const periodCount = Math.max(planLine.periodTargets.length, 1);
      const salaryBase = Math.floor((salaryTotal / periodCount) * 100) / 100;
      const recruitmentBase = Math.floor((recruitmentTotal / periodCount) * 100) / 100;
      return {
        workforcePlanLineId: planLine.id,
        authorizedHeadcount: planLine.plannedHiringSlots,
        allocatedSalaryBudget: salaryTotal,
        allocatedRecruitmentBudget: recruitmentTotal,
        periodAllocations: planLine.periodTargets.map((target, targetIndex) => {
          const last = targetIndex === planLine.periodTargets.length - 1;
          return {
            fiscalPeriodId: target.fiscalPeriodId,
            targetHeadcount: target.newHireSlots + target.replacementSlots,
            allocatedSalaryCost: last ? salaryTotal - salaryBase * (periodCount - 1) : salaryBase,
            allocatedRecruitmentCost: last ? recruitmentTotal - recruitmentBase * (periodCount - 1) : recruitmentBase,
          };
        }),
      };
    }), next);
  };

  const lines = useWatch({ control: form.control, name: 'lines' }) ?? [];
  const save = form.handleSubmit(values => onSave({
    budgetCode: values.budgetCode.trim().toUpperCase(),
    workforcePlanId: Number(values.workforcePlanId),
    currencyCode: values.currencyCode.trim().toUpperCase(),
    lines: values.lines.map(line => ({
      workforcePlanLineId: Number(line.workforcePlanLineId),
      authorizedHeadcount: Number(line.authorizedHeadcount),
      allocatedSalaryBudget: Number(line.allocatedSalaryBudget),
      allocatedRecruitmentBudget: Number(line.allocatedRecruitmentBudget),
      periodAllocations: line.periodAllocations.map(allocation => ({
        fiscalPeriodId: Number(allocation.fiscalPeriodId),
        targetHeadcount: Number(allocation.targetHeadcount),
        allocatedSalaryCost: Number(allocation.allocatedSalaryCost),
        allocatedRecruitmentCost: Number(allocation.allocatedRecruitmentCost),
      })),
    })),
  }));
  return <AppForm visible presentation="fullScreen" title={t(`workforceBudget.form.${mode}Title`)} subtitle={t('workforceBudget.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} serverError={detailError} onCancel={onClose} onSubmit={readOnly ? undefined : save} submitLabel={t(mode === 'edit' ? 'common.save' : 'common.create')} contentContainerStyle={styles.content} footer={detailError && onRetryDetail ? <AppButton variant="outline" onPress={onRetryDetail}>{t('common.retry')}</AppButton> : undefined} mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled: disabled || !activePlan || !activePlan.lines.length } : undefined}>
    <AppFormSection title={t('workforceBudget.form.identity')} icon="document-text-outline">
      <Controller control={form.control} name="budgetCode" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforceBudget.fields.budgetCode')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled && mode === 'create'} error={fieldState.error?.message} required />} />
      <Controller control={form.control} name="workforcePlanId" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('workforceBudget.fields.plan')} options={planOptions} value={field.value} onChange={field.onChange} disabled={disabled || mode !== 'create'} required error={fieldState.error?.message} leadingIcon="document-text-outline" />} />
      <Controller control={form.control} name="currencyCode" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('workforceBudget.fields.currency')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!disabled && (mode === 'create' || (item ? [1, 4].includes(item.status) : true))} error={fieldState.error?.message} required />} />
    </AppFormSection>
    <AppFormSection title={t('workforceBudget.lines.title')} icon="list-outline">
      {lines.map((line, index) => {
        const planLine = activePlan?.lines.find(candidate => candidate.id === Number(line.workforcePlanLineId));
        return <AppCard key={`${line.workforcePlanLineId}-${index}`} padding="sm" variant="outlined">
          <View style={styles.row}><AppText weight="700">{t('workforceBudget.lines.item', { number: index + 1 })}</AppText>{planLine ? <AppStatusBadge color={theme.colors.primary} label={t('workforceBudget.lines.ceiling', { count: planLine.plannedHiringSlots })} /> : null}</View>
          <NumberField control={form.control} name={`lines.${index}.authorizedHeadcount`} label={t('workforceBudget.fields.headcount')} disabled={disabled} />
          <NumberField control={form.control} name={`lines.${index}.allocatedSalaryBudget`} label={t('workforceBudget.fields.salary')} disabled={disabled} />
          <NumberField control={form.control} name={`lines.${index}.allocatedRecruitmentBudget`} label={t('workforceBudget.fields.recruitment')} disabled={disabled} />
          <AllocationFields control={form.control} index={index} disabled={disabled} periods={mode === 'create' ? periodOptions : (item?.lines[index]?.periodAllocations ?? []).map(allocation => ({ value: allocation.fiscalPeriodId, label: `${t('workforceBudget.fields.fiscalPeriod')} ${allocation.fiscalPeriodId}`, icon: 'calendar-outline' }))} currency={currency} />
        </AppCard>;
      })}
      {mode === 'create' && !activePlan ? <AppText color="muted">{t('workforceBudget.form.selectPlanFirst')}</AppText> : null}
    </AppFormSection>
  </AppForm>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24, gap: 12 }, block: { gap: 8 }, badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' }, period: { gap: 6 }, actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 } });
