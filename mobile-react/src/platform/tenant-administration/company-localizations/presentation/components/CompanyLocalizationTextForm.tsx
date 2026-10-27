import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useWatch } from 'react-hook-form';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import { AppButton, AppForm, AppFormSection, AppStateView, AppText, AppTextField, DiscardChangesDialog, showToast, useDiscardChanges } from '@/src/shared/components';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import type { CompanyLocalizationLanguage, CompanyLocalizationStatus, CompanyLocalizationText } from '../../domain/models/company-localization';
import { createCompanyLocalizationTextSchema, createMockLocalizedValue, type CompanyLocalizationTextFormValues } from '../validation/company-localization-validation';

interface Props {
  canEdit: boolean;
  mockDataEnabled?: boolean;
  item: CompanyLocalizationText | null;
  source: string;
  baseLanguage: CompanyLocalizationLanguage;
  targetLanguage: CompanyLocalizationLanguage;
  status: CompanyLocalizationStatus;
  onClose: () => void;
  onReload: () => Promise<void>;
  onSave: (value: string, expectedRevision: number) => Promise<void>;
  revision: number;
  visible: boolean;
}

export function CompanyLocalizationTextForm({ baseLanguage, canEdit, mockDataEnabled=true, item, onClose, onReload, onSave, revision, source, status, targetLanguage, visible }: Props) {
  const { t } = useTranslation();
  const { isReadOnly } = useAppReadOnly();
  const snapshotRevision = useRef(revision);
  const [serverError, setServerError] = useState<string>();
  const schema = useMemo(() => createCompanyLocalizationTextSchema(t('companyLocalizations.valueRequired'), item?.shippedValue), [item?.shippedValue, t]);
  const form = useZodForm<CompanyLocalizationTextFormValues>(schema, { defaultValues: { value: item?.targetValue ?? '' } });
  const { handleSubmit, reset, setValue, formState: { errors, isDirty, isSubmitting } } = form;
  const value = useWatch({ control: form.control, name: 'value' }) ?? '';
  const busy = isSubmitting;

  useEffect(() => {
    if (!item) return;
    snapshotRevision.current = revision;
    reset({ value: item.targetValue });
    // The modal is deliberately reseeded only when a new record is opened.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setServerError(undefined);
  // The opening snapshot, not a background refetch, owns this draft.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.key, reset]);

  const reload = async () => {
    try { await onReload(); onClose(); }
    catch (error) { setServerError(t('companyLocalizations.loadFailed')); showToast.error(error, t('companyLocalizations.loadFailed')); }
  };
  const discard = useDiscardChanges({ active: visible, busy, isDirty, onDiscard: () => { void reload(); } });
  // eslint-disable-next-line react-hooks/refs
  const submit = handleSubmit(async ({ value }) => {
    if (!item || !canEdit || isReadOnly) return;
    setServerError(undefined);
    try {
      await onSave(value, snapshotRevision.current);
      showToast.success(t('companyLocalizations.saved'));
      onClose();
    } catch (error) {
      setServerError(t('companyLocalizations.saveFailed'));
      showToast.error(error, t('companyLocalizations.saveFailed'));
    }
  });

  return <>
    <AppForm
      errors={toFormErrorMap(errors)}
      icon="language-outline"
      isDirty={isDirty}
      mockDataAction={item && mockDataEnabled ? { onGenerate: () => setValue('value', createMockLocalizedValue(item.shippedValue, t('companyLocalizations.mockSuffix')), { shouldDirty: true, shouldValidate: true }) } : undefined}
      onCancel={onClose}
      onSubmit={canEdit && !isReadOnly ? submit : undefined}
      presentation="fullScreen"
      serverError={serverError}
      submitDisabled={!item}
      submitting={busy}
      subtitle={item?.key}
      title={t('companyLocalizations.edit')}
      visible={visible}>
      {!item ? <AppStateView state="loading" /> : (
        <AppFormSection title={t('companyLocalizations.value')}>
          <View style={styles.content}>
            <AppText color="muted" variant="caption">{`${t('companyLocalizations.source')}: ${source} · ${t('companyLocalizations.baseLanguage')}: ${baseLanguage} · ${t('companyLocalizations.targetLanguage')}: ${targetLanguage} · ${t('companyLocalizations.status')}: ${t(`companyLocalizations.${status}`)}`}</AppText>
            <AppText color="muted" variant="caption">{t('companyLocalizations.shippedValue')}</AppText>
            <AppText variant="bodySmall">{item.shippedValue}</AppText>
            <AppTextField counter error={errors.value?.message} label={t('companyLocalizations.value')} maxLength={4000} multiline name="value" numberOfLines={7} onChangeText={(nextValue) => setValue('value', nextValue, { shouldDirty: true, shouldValidate: true })} required value={value} />
            <AppButton disabled={busy} icon="refresh-outline" onPress={discard.requestClose} variant="outline">{t('companyLocalizations.reload')}</AppButton>
          </View>
        </AppFormSection>
      )}
    </AppForm>
    <DiscardChangesDialog loading={busy} onCancel={discard.keepEditing} onDiscard={discard.discard} visible={discard.dialogVisible} />
  </>;
}

const styles = StyleSheet.create({ content: { gap: 10 } });
