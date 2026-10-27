import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppButton, AppForm, AppFormSection, AppSelectField, DiscardChangesDialog, showToast, useDiscardChanges } from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import type { CompanyLocalizationSettings } from '../../domain/models/company-localization';
import { createCompanyLocalizationDefaultSchema, type CompanyLocalizationDefaultFormValues } from '../validation/company-localization-validation';

interface Props { canEdit: boolean; onClose: () => void; onReload: () => Promise<void>; onSave: (language: CompanyLocalizationDefaultFormValues['language'], expectedRevision: number) => Promise<void>; settings: CompanyLocalizationSettings; }

/** Conditionally mounted by the screen so settings are captured once for each open modal. */
export function CompanyLocalizationDefaultForm({ canEdit, onClose, onReload, onSave, settings }: Props) {
  const { t } = useTranslation();
  const { isReadOnly } = useAppReadOnly();
  const [snapshot] = useState(() => ({ language: settings.defaultLanguage, revision: settings.revision }));
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createCompanyLocalizationDefaultSchema(), []);
  const form = useZodForm<CompanyLocalizationDefaultFormValues>(schema, { defaultValues: { language: snapshot.language } });
  const { setValue, handleSubmit, formState: { errors, isDirty, isSubmitting } } = form;
  const language = useWatch({ control: form.control, name: 'language' });
  const reload = async () => {
    try { await onReload(); onClose(); }
    catch (error) { setServerError(t('companyLocalizations.loadFailed')); showToast.error(error, t('companyLocalizations.loadFailed')); }
  };
  const discard = useDiscardChanges({ active: true, busy: isSubmitting, isDirty, onDiscard: () => { void reload(); } });
  const submit = handleSubmit(async ({ language }) => {
    if (!canEdit || isReadOnly) return;
    try { setServerError(undefined); await onSave(language, snapshot.revision); showToast.success(t('companyLocalizations.saved')); onClose(); }
    catch (error) { setServerError(t('companyLocalizations.saveFailed')); showToast.error(error, t('companyLocalizations.saveFailed')); }
  });
  return <><AppForm errors={toFormErrorMap(errors)} icon="language-outline" isDirty={isDirty} onCancel={onClose} onSubmit={canEdit && !isReadOnly ? submit : undefined} presentation="dialog" serverError={serverError} submitting={isSubmitting} subtitle={t('companyLocalizations.languageHint')} title={t('companyLocalizations.setDefault')} visible>
    <AppFormSection title={t('companyLocalizations.defaultLanguage')}>
      <View style={styles.content}>
          <AppSelectField error={errors.language?.message} label={t('companyLocalizations.defaultLanguage')} name="language" onChange={(nextLanguage) => setValue('language', nextLanguage as CompanyLocalizationDefaultFormValues['language'], { shouldDirty: true, shouldValidate: true })} options={[{ value: 'en', label: t('companyLocalizations.english'), icon: 'language-outline' }, { value: 'ar', label: t('companyLocalizations.arabic'), icon: 'language-outline' }]} required value={language} />
          <AppButton disabled={isSubmitting} icon="refresh-outline" onPress={discard.requestClose} variant="outline">{t('companyLocalizations.reload')}</AppButton>
      </View>
    </AppFormSection>
  </AppForm><DiscardChangesDialog loading={isSubmitting} onCancel={discard.keepEditing} onDiscard={discard.discard} visible={discard.dialogVisible} /></>;
}
const styles = StyleSheet.create({ content: { gap: 10 } });
