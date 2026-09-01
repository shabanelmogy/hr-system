import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppDateTimeField, AppForm, AppFormSection, AppTextField } from '@/src/shared/components';
import { createJobDescriptionDecisionSchema } from '../validation/organizational-structure-schema';

interface Props {
  mode: 'approve' | 'reject';
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: { effectiveDate: string; expiryDate: string; reason: string }) => Promise<void>;
}

export function JobDescriptionDecisionForm({ mode, loading, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const schema = useMemo(() => createJobDescriptionDecisionSchema(mode, t), [mode, t]);
  type Values = z.infer<typeof schema>;
  const { clearErrors, control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useZodForm<Values>(schema, {
    defaultValues: { effectiveDate: new Date().toISOString().slice(0, 10), expiryDate: '', reason: '' },
  });
  return <AppForm
    errors={toFormErrorMap(errors)} icon={mode === 'approve' ? 'checkmark-circle-outline' : 'close-circle-outline'}
    isDirty={isDirty} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof Values)}
    onSubmit={handleSubmit(onSubmit)} presentation="dialog" submitLabel={t(`organizationalStructure.decision.${mode}`)}
    submitting={loading || isSubmitting} subtitle={t('organizationalStructure.decision.subtitle')}
    title={t(`organizationalStructure.decision.${mode}Title`)} visible>
    <AppFormSection divider={false} icon="document-text-outline" title={t('organizationalStructure.descriptionDetails')}>
      {mode === 'approve' ? <>
        <Controller control={control} name="effectiveDate" render={({ field }) => <AppDateTimeField disabled={loading} label={t('organizationalStructure.fields.effectiveDate')} name={field.name} onChangeValue={field.onChange} required value={field.value} />} />
        <Controller control={control} name="expiryDate" render={({ field }) => <AppDateTimeField disabled={loading} label={t('organizationalStructure.fields.expiryDate')} name={field.name} onChangeValue={field.onChange} value={field.value} />} />
      </> : <Controller control={control} name="reason" render={({ field }) => <AppTextField editable={!loading} label={t('organizationalStructure.fields.decisionReason')} maxLength={1000} multiline name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />}
    </AppFormSection>
  </AppForm>;
}
