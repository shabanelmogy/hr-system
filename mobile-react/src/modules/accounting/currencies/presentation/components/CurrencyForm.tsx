import { useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppStateView, AppTextField } from '@/src/shared/components';
import type { Currency, CurrencyRequest } from '../../domain/models/currency';
import { createCurrencySchema } from '../validation/currency-schema';

interface Props { item: Currency | null; mode: 'create' | 'edit' | 'view'; loading: boolean; detailLoading?: boolean; detailError?: string | null; onRetryDetail?: () => void; onClose: () => void; onSave: (request: CurrencyRequest) => Promise<void> }
const samples = [
  { currencyCode: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'EGP' },
  { currencyCode: 'USD', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$' },
  { currencyCode: 'SAR', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'SAR' },
] as const;

export function CurrencyForm({ item, mode, loading, detailLoading = false, detailError = null, onRetryDetail, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const schema = useMemo(() => createCurrencySchema(t), [t]); type Values = z.infer<typeof schema>;
  const defaults = useMemo<Values>(() => ({ currencyCode: item?.currencyCode ?? '', nameEn: item?.nameEn ?? '', nameAr: item?.nameAr ?? '', symbol: item?.symbol ?? '' }), [item]);
  const form = useZodForm<Values>(schema, { defaultValues: defaults });
  const readOnly = mode === 'view'; const disabled = readOnly || loading || detailLoading || Boolean(detailError);
  const usedSamples = useRef(0);
  const mock = () => { const sample = samples[usedSamples.current % samples.length]; usedSamples.current += 1; const options = { shouldDirty: true, shouldValidate: true }; form.setValue('currencyCode', sample.currencyCode, options); form.setValue('nameEn', sample.nameEn, options); form.setValue('nameAr', sample.nameAr, options); form.setValue('symbol', sample.symbol, options); };
  return <AppForm visible presentation="fullScreen" title={t(`currencies.form.${mode}Title`)} subtitle={t('currencies.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} submitDisabled={detailLoading || Boolean(detailError)} onCancel={onClose} onClearFieldError={name => form.clearErrors(name as keyof Values)} onSubmit={readOnly ? undefined : form.handleSubmit(values => onSave(values))} submitLabel={t(mode === 'edit' ? 'common.update' : 'common.create')} mockDataAction={__DEV__ && !readOnly ? { onGenerate: mock, disabled } : undefined} contentContainerStyle={styles.content}>
    {detailLoading ? <AppStateView state="loading" /> : null}
    {detailError ? <AppStateView state="error" message={detailError} onRetry={onRetryDetail} /> : null}
    <AppFormSection title={t('currencies.form.identity')} icon="cash-outline">
      <Controller control={form.control} name="currencyCode" render={({ field }) => <AppTextField name={field.name} label={t('currencies.fields.currencyCode')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} autoCapitalize="characters" maxLength={3} required />} />
      <Controller control={form.control} name="nameEn" render={({ field }) => <AppTextField name={field.name} label={t('currencies.fields.nameEn')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={100} required />} />
      <Controller control={form.control} name="nameAr" render={({ field }) => <AppTextField name={field.name} label={t('currencies.fields.nameAr')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={100} required />} />
      <Controller control={form.control} name="symbol" render={({ field }) => <AppTextField name={field.name} label={t('currencies.fields.symbol')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!disabled} maxLength={10} required />} />
    </AppFormSection>
  </AppForm>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 } });
