import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { applyApiFieldErrors, toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppButton, AppForm, AppFormSection, AppSwitchField, AppTextField } from '@/src/shared/components';
import type { AccountHierarchyLevel, AccountHierarchyLevelRequest } from '../../domain/models/coa-hierarchy';
import { createHierarchyLevelFormSchema } from '../validation/coa-hierarchy-schema';

interface Props { item: AccountHierarchyLevel | null; mode: 'create' | 'edit' | 'view'; loading: boolean; canManage: boolean; onClose: () => void; onSave: (request: AccountHierarchyLevelRequest) => Promise<void>; onEdit?: () => void; onLifecycle?: () => void }

export function HierarchyLevelForm({ item, mode, loading, canManage, onClose, onSave, onEdit, onLifecycle }: Props) {
  const { t } = useTranslation();
  const schema = useMemo(() => createHierarchyLevelFormSchema(t), [t]);
  type Values = z.infer<typeof schema>;
  const defaults = useMemo<Values>(() => ({ levelNumber: item?.levelNumber ?? 0, nameAr: item?.nameAr ?? '', nameEn: item?.nameEn ?? '', canPost: item?.canPost ?? false }), [item]);
  const form = useZodForm<Values>(schema, { defaultValues: defaults });
  const [serverError, setServerError] = useState<string | null>(null);
  const readOnly = mode === 'view';
  const submit = form.handleSubmit(async values => { setServerError(null); try { await onSave(values); } catch (error) { if (!applyApiFieldErrors(form, error)) setServerError(error instanceof Error ? error.message : t('coaHierarchy.messages.saveFailed')); } });
  return <AppForm visible presentation="fullScreen" title={t(`coaHierarchy.levels.form.${mode}Title`)} subtitle={t('coaHierarchy.levels.form.subtitle')} icon={mode === 'create' ? 'add-circle-outline' : readOnly ? 'eye-outline' : 'create-outline'} errors={toFormErrorMap(form.formState.errors)} isDirty={form.formState.isDirty} submitting={loading || form.formState.isSubmitting} onCancel={onClose} onClearFieldError={name => form.clearErrors(name as keyof Values)} onSubmit={readOnly ? undefined : submit} submitLabel={t(mode === 'edit' ? 'common.update' : 'common.create')} serverError={serverError} contentContainerStyle={styles.content}>
    <AppFormSection title={t('coaHierarchy.levels.form.identity')} icon="layers-outline">
      {readOnly && item && canManage ? <View style={styles.actions}>{onEdit ? <AppButton variant="outline" onPress={onEdit} icon="create-outline">{t('common.edit')}</AppButton> : null}{onLifecycle ? <AppButton variant="outline" onPress={onLifecycle} icon={item.isDeleted ? 'refresh-outline' : 'archive-outline'}>{t(item.isDeleted ? 'common.restore' : 'common.archive')}</AppButton> : null}</View> : null}
      <Controller control={form.control} name="levelNumber" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.levelNumber')} value={String(field.value || '')} onChangeText={value => field.onChange(Number(value) || 0)} onBlur={field.onBlur} ref={field.ref} editable={!readOnly && !loading} keyboardType="numeric" numeric required />} />
      <Controller control={form.control} name="nameEn" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.nameEn')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!readOnly && !loading} maxLength={150} required />} />
      <Controller control={form.control} name="nameAr" render={({ field }) => <AppTextField name={field.name} label={t('coaHierarchy.fields.nameAr')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} editable={!readOnly && !loading} maxLength={150} required />} />
      <Controller control={form.control} name="canPost" render={({ field, fieldState }) => <AppSwitchField name={field.name} label={t('coaHierarchy.fields.canPost')} value={field.value} onValueChange={field.onChange} disabled={readOnly || loading} error={fieldState.error?.message} />} />
    </AppFormSection>
  </AppForm>;
}

const styles = StyleSheet.create({ content: { paddingBottom: 24 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 } });
