import { useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import type { Country, CountryRequest } from '../types/country';
import { AppForm, AppFormSection, AppTextField } from '@/src/shared/components';
import { createCountryRequestSchema } from '../validation/country-request-schema';
import { getNextCountryMockData } from '../utils/country-mock-data';

interface CountryFormProps {
  country: Country | null;
  loading: boolean;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSave: (request: CountryRequest) => Promise<void>;
}

export function CountryForm({ country, loading, mode, onClose, onSave }: CountryFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(() => createCountryRequestSchema(t), [t]);
  type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({
    nameAr: country?.nameAr ?? '', nameEn: country?.nameEn ?? '',
    alpha2Code: country?.alpha2Code ?? '', alpha3Code: country?.alpha3Code ?? '',
    phoneCode: country?.phoneCode ?? '', currencyCode: country?.currencyCode ?? '',
  }), [country]);
  const { clearErrors, control, handleSubmit, setValue, formState: { errors, isDirty, isSubmitting } } =
    useZodForm<FormValues>(schema, { defaultValues: defaults });
  const usedMockIndexes = useRef(new Set<number>());
  const readOnly = mode === 'view';
  const disabled = loading || readOnly;
  const generateMockData = () => {
    const sample = getNextCountryMockData(usedMockIndexes.current);
    const options = { shouldDirty: true, shouldValidate: true };
    setValue('nameAr', sample.nameAr, options);
    setValue('nameEn', sample.nameEn, options);
    setValue('alpha2Code', sample.alpha2Code ?? '', options);
    setValue('alpha3Code', sample.alpha3Code ?? '', options);
    setValue('phoneCode', sample.phoneCode ?? '', options);
    setValue('currencyCode', sample.currencyCode ?? '', options);
  };
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
      mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled } : undefined}
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
