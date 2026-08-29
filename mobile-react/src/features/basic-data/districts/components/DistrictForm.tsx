import { useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';

import { stateApi, stateKeys } from '@/src/features/basic-data/states';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppSelectField, AppTextField } from '@/src/shared/components';
import type { District, DistrictRequest } from '../types/district';
import { createDistrictRequestSchema } from '../validation/district-request-schema';
import { getNextDistrictMockData } from '../utils/district-mock-data';

interface DistrictFormProps { district: District | null; loading: boolean; mode: 'create' | 'edit' | 'view'; onClose: () => void; onSave: (request: DistrictRequest) => Promise<void>; }
export function DistrictForm({ district, loading, mode, onClose, onSave }: DistrictFormProps) {
  const { t } = useTranslation();
  const states = useQuery({ queryKey: stateKeys.lookup(), queryFn: () => stateApi.getLookup(), staleTime: 5 * 60_000 });
  const schema = useMemo(() => createDistrictRequestSchema(t), [t]);
  type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({ nameAr: district?.nameAr ?? '', nameEn: district?.nameEn ?? '', code: district?.code ?? '', stateId: district?.stateId ?? 0 }), [district]);
  const { clearErrors, control, handleSubmit, setValue, formState: { errors, isDirty, isSubmitting } } = useZodForm<FormValues>(schema, { defaultValues: defaults });
  const readOnly = mode === 'view';
  const disabled = loading || readOnly || states.isLoading;
  const usedMockIndexes = useRef(new Set<number>());
  const stateOptions = (states.data ?? []).map((state) => ({ value: state.id, label: `${state.nameEn} (${state.nameAr})`, icon: 'map-outline' as const }));
  const generateMockData = () => {
    const stateId = stateOptions[0]?.value;
    if (!stateId) return;
    const sample = getNextDistrictMockData(usedMockIndexes.current, stateId);
    const options = { shouldDirty: true, shouldValidate: true };
    setValue('nameAr', sample.nameAr, options);
    setValue('nameEn', sample.nameEn, options);
    setValue('code', sample.code, options);
    setValue('stateId', sample.stateId, options);
  };
  const submit = handleSubmit(async (values) => onSave({ nameAr: values.nameAr.trim(), nameEn: values.nameEn.trim(), code: values.code.trim().toUpperCase(), stateId: values.stateId }));
  return <AppForm contentContainerStyle={styles.content} errors={toFormErrorMap(errors)} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} isDirty={isDirty} mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled: disabled || stateOptions.length === 0 } : undefined} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof FormValues)} onSubmit={readOnly ? undefined : submit} presentation="fullScreen" style={styles.form} submitting={loading || isSubmitting} submitLabel={t('districts.save')} subtitle={t('districts.formSubtitle')} title={t(readOnly ? 'districts.viewDistrict' : mode === 'create' ? 'districts.addDistrict' : 'districts.editDistrict')} visible>
    <AppFormSection icon="map-outline" title={t('districts.identity')}>
      <Controller control={control} name="nameEn" render={({ field }) => <AppTextField editable={!disabled} label={t('districts.nameEn')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
      <Controller control={control} name="nameAr" render={({ field }) => <AppTextField editable={!disabled} label={t('districts.nameAr')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
      <Controller control={control} name="code" render={({ field }) => <AppTextField autoCapitalize="characters" editable={!disabled} label={t('districts.code')} leadingIcon="pricetag-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} />
    </AppFormSection>
    <AppFormSection icon="map-outline" title={t('districts.state')}><Controller control={control} name="stateId" render={({ field }) => <AppSelectField allowWhenReadOnly={readOnly} disabled={disabled} label={t('districts.state')} leadingIcon="map-outline" onChange={field.onChange} options={stateOptions} required value={field.value} />} /></AppFormSection>
  </AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
