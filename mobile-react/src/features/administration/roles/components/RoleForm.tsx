import { useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ApiError } from '@/src/core/api';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import {
  AppForm,
  AppFormSection,
  AppTextField,
  showToast,
} from '@/src/shared/components';
import type { RoleFormValues, RoleOption } from '../../types/administration';
import { createRoleSchema } from '../../validation/role-validation';

interface RoleFormProps {
  loading: boolean;
  mode: 'add' | 'edit' | 'view';
  onClose: () => void;
  onSave: (values: RoleFormValues) => Promise<void>;
  role: RoleOption | null;
}

export function RoleForm({ loading, mode, onClose, onSave, role }: RoleFormProps) {
  const { t } = useTranslation();
  const isView = mode === 'view';
  const schema = useMemo(() => createRoleSchema(t), [t]);
  const [focusErrorRequestId, setFocusErrorRequestId] = useState(0);
  const {
    clearErrors,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useZodForm<RoleFormValues>(schema, {
    defaultValues: { name: role?.name ?? '' },
  });
  const submitting = loading || isSubmitting;
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);
  const submit = handleSubmit(
    async (values) => {
      try {
        await onSave(values);
      } catch (error) {
        if (!applyRoleApiError(error, setError)) {
          showToast.error(error, t('roleManagement.saveFailed'));
        }
      }
    },
    () => setFocusErrorRequestId((current) => current + 1),
  );

  return (
    <AppForm
      errors={fieldErrors}
      focusErrorRequestId={focusErrorRequestId}
      icon={isView ? 'eye-outline' : mode === 'edit' ? 'create-outline' : 'shield-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name as keyof RoleFormValues)}
      onSubmit={isView ? undefined : submit}
      presentation="dialog"
      submitLabel={t(mode === 'edit' ? 'roleManagement.updateRole' : 'roleManagement.createRole')}
      submitting={submitting}
      subtitle={t(
        isView
          ? 'roleManagement.viewSubtitle'
          : mode === 'edit'
            ? 'roleManagement.editSubtitle'
            : 'roleManagement.addSubtitle',
      )}
      title={t(
        isView
          ? 'roleManagement.viewRole'
          : mode === 'edit'
            ? 'roleManagement.editRole'
            : 'roleManagement.addRole',
      )}
      visible>
      <AppFormSection
        description={t('roleManagement.detailsDescription')}
        divider={false}
        icon="shield-checkmark-outline"
        title={t('roleManagement.details')}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <AppTextField
              autoCapitalize="words"
              editable={!submitting && !isView}
              label={t('roleManagement.name')}
              leadingIcon="shield-outline"
              maxLength={50}
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />
      </AppFormSection>
    </AppForm>
  );
}

type SetRoleFieldError = (
  name: keyof RoleFormValues,
  error: { type: string; message: string },
) => void;

function applyRoleApiError(error: unknown, setError: SetRoleFieldError): boolean {
  if (!(error instanceof ApiError) || !error.problem?.errors) return false;

  for (const [fieldName, messages] of Object.entries(error.problem.errors)) {
    if (fieldName.replace(/^request\./i, '').toLowerCase() !== 'name' || !messages[0]) continue;
    setError('name', { type: 'server', message: messages[0] });
    return true;
  }

  return false;
}
