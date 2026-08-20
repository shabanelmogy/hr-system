import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import type { Country, CountryRequest } from '../types/country';
import { AppForm, AppFormSection, AppTextField } from '@/src/shared/components';

interface CountryFormProps {
  country: Country | null;
  loading: boolean;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (request: CountryRequest) => Promise<void>;
}

export function CountryForm({ country, loading, mode, onClose, onSave }: CountryFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => {
    const optionalPattern = (pattern: RegExp, message: string) =>
      z.string().trim().refine((value) => value.length === 0 || pattern.test(value), message);

    return z.object({
      nameAr: z.string().trim()
        .min(2, t('validation.minLength', { count: 2 }))
        .max(100, t('validation.maxLength', { count: 100 }))
        .regex(/^[\p{Script=Arabic}\s]+$/u, t('countries.nameArInvalid')),
      nameEn: z.string().trim()
        .min(2, t('validation.minLength', { count: 2 }))
        .max(100, t('validation.maxLength', { count: 100 }))
        .regex(/^[A-Za-z\s]+$/, t('countries.nameEnInvalid')),
      alpha2Code: optionalPattern(/^[A-Za-z]{2}$/, t('countries.alpha2Invalid')),
      alpha3Code: optionalPattern(/^[A-Za-z]{3}$/, t('countries.alpha3Invalid')),
      phoneCode: optionalPattern(/^\+?\d{1,10}$/, t('countries.phoneCodeInvalid')),
      currencyCode: optionalPattern(/^[A-Za-z]{3}$/, t('countries.currencyCodeInvalid')),
    });
  }, [t]);
  type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({
    nameAr: country?.nameAr ?? '', nameEn: country?.nameEn ?? '',
    alpha2Code: country?.alpha2Code ?? '', alpha3Code: country?.alpha3Code ?? '',
    phoneCode: country?.phoneCode ?? '', currencyCode: country?.currencyCode ?? '',
  }), [country]);
  const { clearErrors, control, handleSubmit, formState: { errors, isDirty, isSubmitting } } =
    useZodForm<FormValues>(schema, { defaultValues: defaults });
  const readOnly = mode === 'view';
  const disabled = loading || readOnly;
  const submit = handleSubmit(async (values) => onSave({
    nameAr: values.nameAr.trim(), nameEn: values.nameEn.trim(),
    alpha2Code: nullable(values.alpha2Code), alpha3Code: nullable(values.alpha3Code),
    phoneCode: nullable(values.phoneCode), currencyCode: nullable(values.currencyCode),
  }));

  return (
    <AppForm
      contentContainerStyle={styles.content}
      errors={toFormErrorMap(errors)}
      icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name as keyof FormValues)}
      onSubmit={readOnly ? undefined : submit}
      presentation="fullScreen"
      style={styles.form}
      submitting={loading || isSubmitting}
      submitLabel={t('countries.save')}
      subtitle={t('countries.formSubtitle')}
      title={t(readOnly ? 'countries.viewCountry' : mode === 'create' ? 'countries.addCountry' : 'countries.editCountry')}
      visible>
      <AppFormSection icon="earth-outline" title={t('countries.identity')}>
        <Controller control={control} name="nameEn" render={({ field }) => <AppTextField editable={!disabled} label={t('countries.nameEn')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
        <Controller control={control} name="nameAr" render={({ field }) => <AppTextField editable={!disabled} label={t('countries.nameAr')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
      </AppFormSection>
      <AppFormSection icon="pricetag-outline" title={t('countries.codes')}>
        <Controller control={control} name="alpha2Code" render={({ field }) => <AppTextField autoCapitalize="characters" editable={!disabled} label={t('countries.alpha2Code')} name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} value={field.value} />} />
        <Controller control={control} name="alpha3Code" render={({ field }) => <AppTextField autoCapitalize="characters" editable={!disabled} label={t('countries.alpha3Code')} name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} value={field.value} />} />
        <Controller control={control} name="currencyCode" render={({ field }) => <AppTextField autoCapitalize="characters" editable={!disabled} label={t('countries.currencyCode')} name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} value={field.value} />} />
        <Controller control={control} name="phoneCode" render={({ field }) => <AppTextField editable={!disabled} keyboardType="phone-pad" label={t('countries.phoneCode')} name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} value={field.value} />} />
      </AppFormSection>
    </AppForm>
  );
}

function nullable(value: string): string | null { return value.trim() || null; }
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
