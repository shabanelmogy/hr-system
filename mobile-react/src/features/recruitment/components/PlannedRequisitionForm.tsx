import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppDataCard, AppForm, AppFormSection, AppSelectField, AppText, AppTextField, type AppSelectOption } from '@/src/shared/components';
import { useApprovedStaffingRequestOptions } from '../queries/use-recruitment';
import { EmploymentType, RequisitionType, WorkArrangement, type JobRequisitionMutation } from '../types';
import { plannedRequisitionSchema, type PlannedRequisitionValues } from '../validation/planned-requisition-schema';

interface Props { visible: boolean; loading: boolean; onClose: () => void; onSave: (request: JobRequisitionMutation) => Promise<void> }

const defaults: PlannedRequisitionValues = { staffingRequestId: 0, requestedPositions: 1, businessReason: '', employmentType: EmploymentType.FullTime, workArrangement: WorkArrangement.OnSite, targetHireDate: '', type: RequisitionType.NewPosition };

export function PlannedRequisitionForm({ visible, loading, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const form = useZodForm(plannedRequisitionSchema, { defaultValues: defaults });
  const optionsQuery = useApprovedStaffingRequestOptions(visible);
  const selectedId = Number(form.watch('staffingRequestId'));
  const selected = optionsQuery.data?.find(item => item.id === selectedId);
  const requested = Number(form.watch('requestedPositions'));
  const exceeds = Boolean(selected && requested > selected.remainingAllocatable);
  const staffingOptions = useMemo<AppSelectOption<number>[]>(() => (optionsQuery.data ?? []).map(item => ({ value: item.id, label: `${item.envelopeCode} — ${item.remainingAllocatable} ${t('recruitment.requisitions.availableSlots')}`, icon: 'people-outline' })), [optionsQuery.data, t]);
  const employmentOptions: AppSelectOption<number>[] = [1, 2, 3, 4, 5].map(value => ({ value, label: t(`recruitment.employmentType.${value}`), icon: 'briefcase-outline' }));
  const workOptions: AppSelectOption<number>[] = [1, 2, 3].map(value => ({ value, label: t(`recruitment.workArrangement.${value}`), icon: 'location-outline' }));
  const typeOptions: AppSelectOption<number>[] = [
    { value: RequisitionType.NewPosition, label: t('recruitment.requisitions.typeNewPosition'), icon: 'person-add-outline' },
    { value: RequisitionType.Replacement, label: t('recruitment.requisitions.typeReplacement'), icon: 'swap-horizontal-outline' },
  ];
  const select = (name: 'staffingRequestId' | 'employmentType' | 'workArrangement' | 'type', label: string, options: AppSelectOption<number>[]) => <Controller control={form.control} name={name} render={({ field, fieldState }) => <AppSelectField name={field.name} label={label} value={Number(field.value)} onChange={field.onChange} options={options} disabled={loading} required error={fieldState.error?.message} />} />;
  const text = (name: 'businessReason' | 'targetHireDate' | 'replacementEmployeeId' | 'requestedPositions', label: string, numeric = false) => <Controller control={form.control} name={name} render={({ field, fieldState }) => <AppTextField name={field.name} label={label} value={String(field.value ?? '')} onChangeText={value => field.onChange(numeric ? Number(value) || 0 : value)} onBlur={field.onBlur} editable={!loading} keyboardType={numeric ? 'numeric' : 'default'} numeric={numeric} multiline={name === 'businessReason'} required={name !== 'targetHireDate'} error={fieldState.error?.message} />} />;
  return <AppForm visible presentation="fullScreen" title={t('recruitment.requisitions.createTitle')} subtitle={t('recruitment.requisitions.plannedCreateSubtitle')} icon="document-text-outline" errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading} onCancel={onClose} onSubmit={form.handleSubmit(values => exceeds ? Promise.resolve() : onSave({ staffingRequestId: values.staffingRequestId, requestedPositions: values.requestedPositions, businessReason: values.businessReason.trim(), employmentType: values.employmentType, workArrangement: values.workArrangement, targetHireDate: values.targetHireDate || undefined, type: values.type, replacementEmployeeId: values.replacementEmployeeId }))} submitLabel={t('common.create')}>
    <AppFormSection title={t('recruitment.requisitions.title')} icon="document-text-outline">
      {select('staffingRequestId', t('recruitment.requisitions.staffingRequest'), staffingOptions)}
      {selected ? <AppDataCard padding="md"><AppText weight="800">{selected.envelopeCode}</AppText><AppText color="muted">{t('recruitment.requisitions.serverDerivedOrganization', { position: selected.positionId, branch: selected.branchId ?? '—', department: selected.departmentId, division: selected.divisionId })}</AppText><AppText color={exceeds ? 'danger' : 'default'}>{t('recruitment.requisitions.capacityLine', { available: selected.remainingAllocatable, remainingToHire: selected.remainingToHire, cost: selected.estimatedFiscalYearCostPerSlot, currency: selected.currencyCode })}</AppText></AppDataCard> : null}
      {text('requestedPositions', t('recruitment.requisitions.requestedPositions'), true)}
      {exceeds ? <AppText color="danger">{t('recruitment.requisitions.quotaExceeded')}</AppText> : null}
      {text('targetHireDate', t('recruitment.requisitions.targetHireDate'))}
      {select('type', t('recruitment.requisitions.requestType'), typeOptions)}
      {Number(form.watch('type')) === RequisitionType.Replacement ? text('replacementEmployeeId', t('recruitment.requisitions.replacementEmployee'), true) : null}
      {select('employmentType', t('recruitment.openings.employmentType'), employmentOptions)}
      {select('workArrangement', t('recruitment.openings.workArrangement'), workOptions)}
      {text('businessReason', t('recruitment.requisitions.businessReason'))}
    </AppFormSection>
  </AppForm>;
}
