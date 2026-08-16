import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { LocalizationEntry } from '@/src/features/platform-tools/types/platform-tools';
import { getPlatformToolErrorMessage } from '@/src/features/platform-tools/utils/platform-tool-utils';
import { AppForm, AppFormSection, AppTextField } from '@/src/shared/components';

interface LocalizationEditModalProps {
  entry: LocalizationEntry;
  loading: boolean;
  onClose: () => void;
  onSave: (value: string) => Promise<void>;
}

export function LocalizationEditModal({
  entry,
  loading,
  onClose,
  onSave,
}: LocalizationEditModalProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState(entry.value);
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy = loading || submitting;

  const submit = async () => {
    if (!value.trim()) {
      setError(t('validation.required'));
      return;
    }
    setSubmitting(true);
    try {
      await onSave(value);
    } catch (submitError) {
      setServerError(getPlatformToolErrorMessage(
        submitError,
        t('platformTools.localization.saveFailed'),
      ));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppForm
      errors={error ? { value: error } : {}}
      icon="language-outline"
      isDirty={value !== entry.value}
      onCancel={onClose}
      onClearFieldError={() => setError(null)}
      onSubmit={submit}
      presentation="dialog"
      serverError={serverError}
      submitLabel={t('platformTools.localization.update')}
      submitting={busy}
      subtitle={entry.key}
      title={t('platformTools.localization.editTitle')}
      visible>
      <AppFormSection
        description={t('platformTools.localization.editDescription')}
        divider={false}
        icon="text-outline"
        title={t('platformTools.localization.translation')}>
        <AppTextField
          label={t('platformTools.localization.key')}
          leadingIcon="key-outline"
          readOnly
          value={entry.key}
        />
        <AppTextField
          editable={!busy}
          label={t('platformTools.localization.value')}
          leadingIcon="create-outline"
          maxLength={4000}
          multiline
          name="value"
          onChangeText={(nextValue) => {
            setValue(nextValue);
            setError(null);
            setServerError(null);
          }}
          required
          value={value}
        />
      </AppFormSection>
    </AppForm>
  );
}
