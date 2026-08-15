import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import type { TenantManagementResponse } from '@/src/features/tenants';
import type {
  TenantAdmin,
  TenantAdminFormValues,
  TenantAdminRequest,
} from '@/src/features/tenant-admins/types/tenant-admin';
import {
  AppForm,
  AppFormSection,
  AppMultiSelectField,
  AppSelectField,
  AppSwitchField,
  AppTextField,
} from '@/src/shared/components';

interface TenantAdminFormProps {
  admin: TenantAdmin | null;
  tenants: readonly TenantManagementResponse[];
  loading: boolean;
  onClose: () => void;
  onSave: (request: TenantAdminRequest) => Promise<void>;
}

export function TenantAdminForm({
  admin,
  tenants,
  loading,
  onClose,
  onSave,
}: TenantAdminFormProps) {
  const { t } = useTranslation();
  const schema = useMemo(
    () => createSchema(Boolean(admin), t('validation.required'), t('validation.invalidEmail')),
    [admin, t],
  );
  const defaults = useMemo(() => createDefaults(admin), [admin]);
  const {
    clearErrors,
    control,
    getValues,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useZodForm<TenantAdminFormValues>(schema, { defaultValues: defaults });
  const selectedTenantIds = watch('tenantIds') ?? [];
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);
  const submitting = loading || isSubmitting;
  const tenantOptions = tenants.map((tenant) => ({
    value: tenant.id,
    label: `${tenant.name} (${tenant.identifier})`,
    icon: 'business-outline' as const,
    disabled: !tenant.isActive,
  }));
  const defaultTenantOptions = tenantOptions.filter((tenant) =>
    selectedTenantIds.includes(tenant.value),
  );

  const submit = handleSubmit(async (values) => {
    await onSave({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      userName: values.userName.trim(),
      email: values.email.trim(),
      password: values.password.trim() || undefined,
      isDisabled: values.isDisabled,
      tenantIds: values.tenantIds,
      defaultTenantId: values.defaultTenantId,
    });
  });

  return (
    <AppForm
      contentContainerStyle={styles.content}
      errors={fieldErrors}
      icon={admin ? 'create-outline' : 'person-add-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name as keyof TenantAdminFormValues)}
      onSubmit={submit}
      presentation="fullScreen"
      style={styles.form}
      submitting={submitting}
      subtitle={t('tenantAdmins.formSubtitle')}
      title={t(admin ? 'tenantAdmins.edit' : 'tenantAdmins.add')}
      visible>
      <AppFormSection
        description={t('tenantAdmins.identityDescription')}
        icon="person-outline"
        title={t('tenantAdmins.identity')}>
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <AppTextField
              editable={!submitting}
              label={t('tenantAdmins.firstName')}
              leadingIcon="person-outline"
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <AppTextField
              editable={!submitting}
              label={t('tenantAdmins.lastName')}
              leadingIcon="person-outline"
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="userName"
          render={({ field }) => (
            <AppTextField
              autoCapitalize="none"
              editable={!submitting}
              label={t('tenantAdmins.userName')}
              leadingIcon="at-outline"
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <AppTextField
              autoCapitalize="none"
              editable={!submitting}
              keyboardType="email-address"
              label={t('tenantAdmins.email')}
              leadingIcon="mail-outline"
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required
              value={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <AppTextField
              editable={!submitting}
              label={t(admin ? 'tenantAdmins.newPassword' : 'tenantAdmins.password')}
              leadingIcon="lock-closed-outline"
              name={field.name}
              onBlur={field.onBlur}
              onChangeText={field.onChange}
              ref={field.ref}
              required={!admin}
              secureTextEntry
              value={field.value}
            />
          )}
        />
      </AppFormSection>

      <AppFormSection
        description={t('tenantAdmins.accessDescription')}
        icon="shield-checkmark-outline"
        title={t('tenantAdmins.access')}>
        <Controller
          control={control}
          name="tenantIds"
          render={({ field }) => (
            <AppMultiSelectField
              disabled={submitting}
              label={t('tenantAdmins.tenants')}
              leadingIcon="business-outline"
              name={field.name}
              onChange={(tenantIds) => {
                field.onChange(tenantIds);
                if (!tenantIds.includes(getValues('defaultTenantId'))) {
                  setValue('defaultTenantId', tenantIds[0] ?? '', {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              options={tenantOptions}
              placeholder={t('tenantAdmins.selectTenants')}
              required
              values={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="defaultTenantId"
          render={({ field }) => (
            <AppSelectField
              disabled={submitting || defaultTenantOptions.length === 0}
              label={t('tenantAdmins.defaultTenant')}
              leadingIcon="home-outline"
              name={field.name}
              onChange={field.onChange}
              options={defaultTenantOptions}
              placeholder={t('tenantAdmins.selectDefaultTenant')}
              required
              value={field.value}
            />
          )}
        />
        {admin ? (
          <Controller
            control={control}
            name="isDisabled"
            render={({ field }) => (
              <AppSwitchField
                disabled={submitting}
                icon="pause-circle-outline"
                label={t('tenantAdmins.disableAccount')}
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              />
            )}
          />
        ) : null}
      </AppFormSection>
    </AppForm>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  form: {
    gap: 16,
  },
});

function createSchema(isEdit: boolean, required: string, invalidEmail: string) {
  return z.object({
    firstName: z.string().trim().min(1, required).max(50),
    lastName: z.string().trim().min(1, required).max(50),
    userName: z.string().trim().min(1, required).max(50),
    email: z.string().trim().min(1, required).email(invalidEmail),
    password: isEdit ? z.string() : z.string().min(8, required),
    isDisabled: z.boolean(),
    tenantIds: z.array(z.string().min(1)).min(1, required),
    defaultTenantId: z.string().min(1, required),
  }).refine((values) => values.tenantIds.includes(values.defaultTenantId), {
    path: ['defaultTenantId'],
    message: required,
  });
}

function createDefaults(admin: TenantAdmin | null): TenantAdminFormValues {
  return {
    firstName: admin?.firstName ?? '',
    lastName: admin?.lastName ?? '',
    userName: admin?.userName ?? '',
    email: admin?.email ?? '',
    password: '',
    isDisabled: admin?.isDisabled ?? false,
    tenantIds: admin?.tenants.map((tenant) => tenant.id) ?? [],
    defaultTenantId: admin?.defaultTenantId ?? '',
  };
}
