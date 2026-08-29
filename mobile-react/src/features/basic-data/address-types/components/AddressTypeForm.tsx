import { useMemo, useRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppForm, AppFormSection, AppTextField } from '@/src/shared/components';
import type { AddressType, AddressTypeRequest } from '../types/address-type';
import { createAddressTypeRequestSchema } from '../validation/address-type-request-schema';
import { getNextAddressTypeMockData } from '../utils/address-type-mock-data';

export function AddressTypeForm({ addressType, loading, mode, onClose, onSave }: { addressType: AddressType | null; loading: boolean; mode: 'create' | 'edit' | 'view'; onClose: () => void; onSave: (request: AddressTypeRequest) => Promise<void> }) {
  const { t } = useTranslation(); const schema = useMemo(() => createAddressTypeRequestSchema(t), [t]); type FormValues = z.infer<typeof schema>;
  const defaults = useMemo<FormValues>(() => ({ nameAr: addressType?.nameAr ?? '', nameEn: addressType?.nameEn ?? '' }), [addressType]); const { clearErrors, control, handleSubmit, setValue, formState: { errors, isDirty, isSubmitting } } = useZodForm<FormValues>(schema, { defaultValues: defaults }); const readOnly = mode === 'view'; const disabled = loading || readOnly; const usedMockIndexes = useRef(new Set<number>());
  const generateMockData = () => { const sample = getNextAddressTypeMockData(usedMockIndexes.current); const options = { shouldDirty: true, shouldValidate: true }; setValue('nameAr', sample.nameAr, options); setValue('nameEn', sample.nameEn, options); };
  return <AppForm contentContainerStyle={styles.content} errors={toFormErrorMap(errors)} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} isDirty={isDirty} mockDataAction={__DEV__ && !readOnly ? { onGenerate: generateMockData, disabled } : undefined} onCancel={onClose} onClearFieldError={(name) => clearErrors(name as keyof FormValues)} onSubmit={readOnly ? undefined : handleSubmit(async (values) => onSave({ nameAr: values.nameAr.trim(), nameEn: values.nameEn.trim() }))} presentation="fullScreen" style={styles.form} submitting={loading || isSubmitting} submitLabel={t('addressTypes.save')} subtitle={t('addressTypes.formSubtitle')} title={t(readOnly ? 'addressTypes.viewAddressType' : mode === 'create' ? 'addressTypes.addAddressType' : 'addressTypes.editAddressType')} visible><AppFormSection icon="home-outline" title={t('addressTypes.identity')}><Controller control={control} name="nameEn" render={({ field }) => <AppTextField editable={!disabled} label={t('addressTypes.nameEn')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} /><Controller control={control} name="nameAr" render={({ field }) => <AppTextField editable={!disabled} label={t('addressTypes.nameAr')} leadingIcon="language-outline" name={field.name} onBlur={field.onBlur} onChangeText={field.onChange} ref={field.ref} required value={field.value} />} /></AppFormSection></AppForm>;
}
const styles = StyleSheet.create({ content: { paddingBottom: 24 }, form: { gap: 16 } });
