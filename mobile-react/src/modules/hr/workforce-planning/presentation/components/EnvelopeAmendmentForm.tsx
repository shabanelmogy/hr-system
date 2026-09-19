import { useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { applyApiFieldErrors, toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppSelectField, AppTextField } from '@/src/shared/components';
import { usePositionEnvelopeSelector } from '../hooks/use-position-envelope-selector';
import type { EnvelopeAmendmentDetail, EnvelopeAmendmentRequest } from '../../domain/models/staffing';
import { createEnvelopeAmendmentSchema } from '../validation/staffing-schema';

interface Props { visible: boolean; item?: EnvelopeAmendmentDetail | null; loading: boolean; onClose: () => void; onSave: (request: EnvelopeAmendmentRequest) => Promise<void> }
export function EnvelopeAmendmentForm({ visible, item, loading, onClose, onSave }: Props) {
  const { t } = useTranslation(); const readOnly = Boolean(item);
  const schema = useMemo(() => createEnvelopeAmendmentSchema(t), [t]);
  const form = useZodForm(schema, { defaultValues: { envelopeId: 0, additionalHeadcount: 1, additionalSalaryCost: 0, justification: '' } });
  const [serverError, setServerError] = useState<string | null>(null);
  const selectedEnvelopeId = form.watch('envelopeId');
  const envelopeSelector = usePositionEnvelopeSelector(selectedEnvelopeId);
  useEffect(() => { if (visible) form.reset(item ? { envelopeId: item.envelopeId, additionalHeadcount: item.additionalHeadcount, additionalSalaryCost: item.additionalSalaryCost, justification: item.justification } : { envelopeId: 0, additionalHeadcount: 1, additionalSalaryCost: 0, justification: '' }); }, [form, item, visible]);
  const numberField = (name: 'additionalHeadcount' | 'additionalSalaryCost', label: string) => <Controller control={form.control} name={name} render={({ field, fieldState }) => <AppTextField name={field.name} label={label} value={String(field.value)} onChangeText={value => field.onChange(Number(value) || 0)} onBlur={field.onBlur} editable={!readOnly && !loading} keyboardType="numeric" numeric required error={fieldState.error?.message} />} />;
  const submit = form.handleSubmit(async values => {
    setServerError(null);
    try {
      await onSave({ envelopeId: values.envelopeId, additionalHeadcount: values.additionalHeadcount, additionalSalaryCost: values.additionalSalaryCost, justification: values.justification.trim() });
    } catch (error) {
      if (!applyApiFieldErrors(form, error)) setServerError(error instanceof Error ? error.message : t('staffing.messages.lifecycleError'));
    }
  });
  return <AppForm visible presentation="fullScreen" title={t(readOnly ? 'staffing.amendments.viewTitle' : 'staffing.amendments.createTitle')} subtitle={t('staffing.amendments.subtitle')} icon="add-circle-outline" errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading} serverError={serverError} onCancel={onClose} onSubmit={readOnly ? undefined : submit} submitLabel={t('common.create')}>
    <AppFormSection title={t('staffing.amendments.title')} icon="cube-outline">
      <Controller control={form.control} name="envelopeId" render={({ field, fieldState }) => <AppSelectField name={field.name} label={t('staffing.fields.envelope')} options={envelopeSelector.options} value={field.value} onChange={field.onChange} disabled={readOnly || loading} required error={fieldState.error?.message} searchable={!readOnly} searchValue={envelopeSelector.search} onSearchChange={envelopeSelector.setSearch} searchPlaceholder={t('staffing.search')} hasMore={envelopeSelector.hasMore} loadingMore={envelopeSelector.loadingMore} onLoadMore={() => { void envelopeSelector.loadMore(); }} optionsLoading={envelopeSelector.loading} optionsError={envelopeSelector.error ? t('staffing.messages.fetchError') : undefined} onRetryOptions={() => { void envelopeSelector.retry(); }} />} />
      {numberField('additionalHeadcount', t('staffing.fields.additionalHeadcount'))}
      {numberField('additionalSalaryCost', t('staffing.fields.additionalSalaryCost'))}
      <Controller control={form.control} name="justification" render={({ field, fieldState }) => <AppTextField name={field.name} label={t('staffing.fields.justification')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!readOnly && !loading} multiline required error={fieldState.error?.message} />} />
    </AppFormSection>
  </AppForm>;
}
