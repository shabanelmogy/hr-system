import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { applyApiFieldErrors, toFormErrorMap, useZodForm } from '@/src/core/validation';
import { useAppTheme } from '@/src/core/theme';
import { createMoney, formatMoney } from '@/src/core/erp';
import { useLocalization } from '@/src/core/localization';
import { AppForm, AppFormSection, AppSelectField, AppStateView, AppStatusBadge, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { usePositionEnvelopeSelector } from '../hooks/use-position-envelope-selector';
import type { StaffingRequestDetail, StaffingRequestInput, StaffingRequestPriority, StaffingRequestType } from '../../domain/models/staffing';
import { createStaffingRequestSchema } from '../validation/staffing-schema';

interface Props { visible: boolean; mode: 'create' | 'view'; item?: StaffingRequestDetail | null; loading: boolean; detailLoading?: boolean; detailError?: string | null; onClose: () => void; onSave: (request: StaffingRequestInput) => Promise<void> }
const defaults = { envelopeId: 0, requestedHeadcount: 1, estimatedAnnualSalaryPerSlot: 0, targetStartDate: '', requestType: 1, priority: 2, justification: '' };
export function StaffingRequestForm({ visible, mode, item, loading, detailLoading = false, detailError = null, onClose, onSave }: Props) {
  const { t } = useTranslation(); const { language } = useLocalization(); const { theme } = useAppTheme(); const readOnly = mode === 'view';
  const [serverError, setServerError] = useState<string | null>(null);
  const schema = useMemo(() => createStaffingRequestSchema(t), [t]); const form = useZodForm(schema, { defaultValues: defaults });
  const selectedEnvelopeId = form.watch('envelopeId');
  const envelopeSelector = usePositionEnvelopeSelector(selectedEnvelopeId, true);
  const typeOptions = useMemo<AppSelectOption<number>[]>(() => [
    { value: 1, label: t('staffing.type.newHire'), icon: 'person-add-outline' },
    { value: 2, label: t('staffing.type.replacement'), icon: 'swap-horizontal-outline' },
  ], [t]);
  const priorityOptions = useMemo<AppSelectOption<number>[]>(() => [1, 2, 3, 4].map(value => ({
    value,
    label: t(`staffing.priority.${value}`),
    icon: 'flag-outline',
  })), [t]);
  useEffect(() => { if (visible) form.reset(item ? { envelopeId: item.envelopeId, requestedHeadcount: item.requestedHeadcount, estimatedAnnualSalaryPerSlot: item.estimatedAnnualSalaryPerSlot, targetStartDate: item.targetStartDate, requestType: item.requestType, priority: item.priority, justification: item.justification } : defaults); }, [form, item, visible]);
  const numberField = (name: 'requestedHeadcount' | 'estimatedAnnualSalaryPerSlot', label: string) => <Controller control={form.control} name={name} render={({ field, fieldState }) => <AppTextField name={field.name} label={label} value={String(field.value)} onChangeText={value => field.onChange(Number(value) || 0)} onBlur={field.onBlur} editable={!readOnly && !loading} keyboardType="numeric" numeric required error={fieldState.error?.message} />} />;
  const submit = form.handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSave({ envelopeId: values.envelopeId, requestedHeadcount: values.requestedHeadcount, estimatedAnnualSalaryPerSlot: values.estimatedAnnualSalaryPerSlot, targetStartDate: values.targetStartDate, requestType: values.requestType as StaffingRequestType, priority: values.priority as StaffingRequestPriority, justification: values.justification.trim() });
    } catch (error) {
      if (!applyApiFieldErrors(form, error)) setServerError(error instanceof Error ? error.message : t('staffing.messages.lifecycleError'));
    }
  });
  return <AppForm visible presentation="fullScreen" title={t(readOnly ? 'staffing.requests.viewTitle' : 'staffing.requests.createTitle')} subtitle={t('staffing.requests.subtitle')} icon="people-outline" errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading} serverError={detailError ?? serverError} onCancel={onClose} onSubmit={readOnly ? undefined : submit} submitLabel={t('common.create')}>
    {readOnly && detailLoading ? <AppStateView state="loading" /> : null}
    {readOnly && !detailLoading && detailError ? <AppStateView state="error" message={detailError} /> : null}
    {(!readOnly || (!detailLoading && !detailError && item)) ? <>
    <AppFormSection title={t('staffing.requests.title')} icon="people-outline">
      <Controller control={form.control} name="envelopeId" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.envelope')} options={envelopeSelector.options} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} searchable={!readOnly} searchValue={envelopeSelector.search} onSearchChange={envelopeSelector.setSearch} searchPlaceholder={t('staffing.search')} hasMore={envelopeSelector.hasMore} loadingMore={envelopeSelector.loadingMore} onLoadMore={() => { void envelopeSelector.loadMore(); }} optionsLoading={envelopeSelector.loading} optionsError={envelopeSelector.error ? t('staffing.messages.fetchError') : undefined} onRetryOptions={() => { void envelopeSelector.retry(); }} />} />
      {numberField('requestedHeadcount', t('staffing.fields.requestedHeadcount'))}{numberField('estimatedAnnualSalaryPerSlot', t('staffing.fields.annualSalary'))}
      <Controller control={form.control} name="targetStartDate" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('staffing.fields.targetStartDate')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!readOnly && !loading} placeholder={t('common.isoDateFormat')} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="requestType" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.requestType')} options={typeOptions} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="priority" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.priority')} options={priorityOptions} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="justification" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('staffing.fields.justification')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!readOnly && !loading} multiline required error={fieldState.error?.message} />} />
      {item ? <><AppStatusBadge color={theme.colors.primary} label={t('staffing.capacity.allocatable', { count: item.remainingAllocatable })} /><AppStatusBadge color={theme.colors.primary} label={t('staffing.capacity.toHire', { count: item.remainingToHire })} /><AppText>{formatMoney(createMoney(item.totalReservedCost, item.currencyCode), language)} · {item.calculationPolicyVersion}</AppText></> : null}
    </AppFormSection>
    </> : null}
  </AppForm>;
}
