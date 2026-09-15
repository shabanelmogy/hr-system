import { useEffect, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { useAppTheme } from '@/src/core/theme';
import { AppForm, AppFormSection, AppSelectField, AppStatusBadge, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { usePositionEnvelopes } from '../queries/use-workforce-budgets';
import type { StaffingRequestDetail, StaffingRequestInput, StaffingRequestPriority, StaffingRequestType } from '../../domain/models/staffing';
import { createStaffingRequestSchema } from '../validation/staffing-schema';

interface Props { visible: boolean; item?: StaffingRequestDetail | null; loading: boolean; onClose: () => void; onSave: (request: StaffingRequestInput) => Promise<void> }
const defaults = { envelopeId: 0, requestedHeadcount: 1, estimatedAnnualSalaryPerSlot: 0, targetStartDate: '', requestType: 1, priority: 2, justification: '' };
export function StaffingRequestForm({ visible, item, loading, onClose, onSave }: Props) {
  const { t } = useTranslation(); const { theme } = useAppTheme(); const readOnly = Boolean(item);
  const schema = useMemo(() => createStaffingRequestSchema(t), [t]); const form = useZodForm(schema, { defaultValues: defaults });
  const envelopes = usePositionEnvelopes({ pageNumber: 1, pageSize: 50, sortBy: 'envelopeCode', sortDirection: 'asc' });
  const envelopeOptions = useMemo<AppSelectOption<number>[]>(() => (envelopes.data?.items ?? []).filter(envelope => envelope.availableHeadcount > 0).map(envelope => ({ value: envelope.id, label: `${envelope.envelopeCode} — ${envelope.availableHeadcount} / ${envelope.availableSalaryBudget} ${envelope.currencyCode}`, icon: 'cube-outline' })), [envelopes.data]);
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
  return <AppForm visible presentation="fullScreen" title={t(readOnly ? 'staffing.requests.viewTitle' : 'staffing.requests.createTitle')} subtitle={t('staffing.requests.subtitle')} icon="people-outline" errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading} onCancel={onClose} onSubmit={readOnly ? undefined : form.handleSubmit(values => onSave({ envelopeId: values.envelopeId, requestedHeadcount: values.requestedHeadcount, estimatedAnnualSalaryPerSlot: values.estimatedAnnualSalaryPerSlot, targetStartDate: values.targetStartDate, requestType: values.requestType as StaffingRequestType, priority: values.priority as StaffingRequestPriority, justification: values.justification.trim() }))} submitLabel={t('common.create')}>
    <AppFormSection title={t('staffing.requests.title')} icon="people-outline">
      <Controller control={form.control} name="envelopeId" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.envelope')} options={envelopeOptions} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} />} />
      {numberField('requestedHeadcount', t('staffing.fields.requestedHeadcount'))}{numberField('estimatedAnnualSalaryPerSlot', t('staffing.fields.annualSalary'))}
      <Controller control={form.control} name="targetStartDate" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('staffing.fields.targetStartDate')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!readOnly && !loading} placeholder={t('common.isoDateFormat')} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="requestType" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.requestType')} options={typeOptions} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="priority" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.priority')} options={priorityOptions} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} />} />
      <Controller control={form.control} name="justification" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('staffing.fields.justification')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!readOnly && !loading} multiline required error={fieldState.error?.message} />} />
      {item ? <><AppStatusBadge color={theme.colors.primary} label={t('staffing.capacity.allocatable', { count: item.remainingAllocatable })} /><AppStatusBadge color={theme.colors.primary} label={t('staffing.capacity.toHire', { count: item.remainingToHire })} /><AppText>{item.totalReservedCost} {item.currencyCode} · {item.calculationPolicyVersion}</AppText></> : null}
    </AppFormSection>
  </AppForm>;
}
