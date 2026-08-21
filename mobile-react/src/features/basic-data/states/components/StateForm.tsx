import { useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { countryApi, countryKeys } from '@/src/features/basic-data/countries';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppSelectField, AppTextField } from '@/src/shared/components';
import type { State, StateRequest } from '../types/state';

interface StateFormProps { state: State | null; loading: boolean; mode: 'create' | 'edit' | 'view'; onClose: () => void; onSave: (request: StateRequest) => Promise<void>; }
export function StateForm({ state, loading, mode, onClose, onSave }: StateFormProps) {
  const { t } = useTranslation();
  const countries = useQuery({ queryKey: countryKeys.lookup(), queryFn: countryApi.getLookup, staleTime: 5 * 60_000 });
  const schema = useMemo(() => z.object({
    nameAr: z.string().trim().min(2, t('validation.minLength', { count: 2 })).max(100, t('validation.maxLength', { count: 100 })).regex(/^[\p{Script=Arabic}\s]+$/u, t('states.nameArInvalid')),
    nameEn: z.string().trim().min(2, t('validation.minLength', { count: 2 })).max(100, t('validation.maxLength', { count: 100 })).regex(/^[A-Za-z\s]+$/, t('states.nameEnInvalid')),
    code: z.string().trim().min(2, t('validation.minLength', { count: 2 })).max(10, t('validation.maxLength', { count: 10 })).regex(/^[A-Za-z0-9_-]+$/, t('states.codeInvalid')),
    countryId: z.number().int().positive(t('states.countryRequired')),
  }), [t]);
  type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({ nameAr: state?.nameAr ?? '', nameEn: state?.nameEn ?? '', code: state?.code ?? '', countryId: state?.countryId ?? 0 }), [state]);
  const { clearErrors, control, handleSubmit, formState: { errors, isDirty, isSubmitting } } = useZodForm<FormValues>(schema, { defaultValues: defaults });
  const readOnly = mode === 'view';
  const disabled = loading || readOnly || countries.isLoading;
  const countryOptions = (countries.data ?? []).map((country) => ({ value: country.id, label: `${country.nameEn} (${country.nameAr})`, icon: 'flag-outline' as const }));
  const submit = handleSubmit(async (values) => onSave({ nameAr: values.nameAr.trim(), nameEn: values.nameEn.trim(), code: values.code.trim().toUpperCase(), countryId: values.countryId }));
  return <AppForm contentContainerStyle={styles.content} errors={toFormErrorMap(errors)} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} isDirty={isDirty} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof FormValues)} onSubmit={readOnly ? undefined : submit} presentation="fullScreen" style={styles.form} submitting={loading || isSubmitting} submitLabel={t('states.save')} subtitle={t('states.formSubtitle')} title={t(readOnly ? 'states.viewState' : mode === 'create' ? 'states.addState' : 'states.editState')} visible>
    <AppFormSection icon="map-outline" title={t('states.identity')}>
      <Controller control={control} name="nameEn" render={({ field }) => <AppTextField editable={!disabled} label={t('states.nameEn')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
      <Controller control={control} name="nameAr" render={({ field }) => <AppTextField editable={!disabled} label={t('states.nameAr')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
      <Controller control={control} name="code" render={({ field }) => <AppTextField autoCapitalize="characters" editable={!disabled} label={t('states.code')} leadingIcon="pricetag-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
    </AppFormSection>
    <AppFormSection icon="flag-outline" title={t('states.country')}><Controller control={control} name="countryId" render={({ field }) => <AppSelectField allowWhenReadOnly={readOnly} disabled={disabled} label={t('states.country')} leadingIcon="flag-outline" onChange={field.onChange} options={countryOptions} required value={field.value} />} /></AppFormSection>
  </AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
