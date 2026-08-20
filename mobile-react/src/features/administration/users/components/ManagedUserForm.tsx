import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { ApiError } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import type {
  ManagedUser,
  ManagedUserFormValues,
  RoleOption,
  UserCompanyOption,
} from '../../types/administration';
import { createManagedUserSchema } from '../../validation/managed-user-validation';
import {
  AppForm,
  AppFormSection,
  AppButton,
  AppIcon,
  AppMultiSelectField,
  AppSelectField,
  AppText,
  AppTextField,
  showToast,
} from '@/src/shared/components';

interface ManagedUserFormProps {
  companies: readonly UserCompanyOption[];
  currentCompanyId: number;
  loading: boolean;
  onClose: () => void;
  onSave: (values: ManagedUserFormValues) => Promise<void>;
  roles: readonly RoleOption[];
  user: ManagedUser | null;
  mode: 'add' | 'edit' | 'view' | 'invite';
}

export function ManagedUserForm({
  companies,
  currentCompanyId,
  loading,
  onClose,
  onSave,
  roles,
  user,
  mode,
}: ManagedUserFormProps) {
  const { t, i18n } = useTranslation();
  const isAdd = mode === 'add';
  const isEdit = mode === 'edit';
  const isInvite = mode === 'invite';
  const isView = mode === 'view';
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [focusErrorRequestId, setFocusErrorRequestId] = useState(0);
  const schema = useMemo(() => createManagedUserSchema(t, mode), [mode, t]);
  const defaults = useMemo<ManagedUserFormValues>(() => createDefaults(user, currentCompanyId), [
    currentCompanyId,
    user,
  ]);
  const {
    clearErrors,
    control,
    getValues,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useZodForm<ManagedUserFormValues>(schema, { defaultValues: defaults });
  const selectedCompanyIds = watch('companyIds') ?? [];
  const selectedRoles = watch('roles') ?? [];
  const watchedPassword = watch('password');
  const submitting = loading || isSubmitting;
  const fieldErrors = useMemo(() => toFormErrorMap(errors), [errors]);

  const companyOptions = companies.map((company) => ({
    value: company.id,
    label: i18n.language.startsWith('ar') ? company.nameAr : company.nameEn,
    icon: 'business-outline' as const,
    disabled: !company.isActive,
  }));
  const defaultCompanyOptions = companyOptions.filter((company) =>
    selectedCompanyIds.includes(company.value),
  );
  const availableRoleOptions = roles
    .filter((role) => !role.isDeleted)
    .map((role) => ({
      value: role.name,
      label: role.name,
      icon: 'shield-checkmark-outline' as const,
    }));
  const availableRoleNames = new Set(availableRoleOptions.map((role) => role.value));
  const roleOptions = [
    ...availableRoleOptions,
    ...selectedRoles
      .filter((role) => !availableRoleNames.has(role))
      .map((role) => ({
        value: role,
        label: role,
        icon: 'shield-checkmark-outline' as const,
      })),
  ];
  const passwordStrength = useMemo(
    () => getPasswordStrength(watchedPassword, t),
    [t, watchedPassword],
  );

  const submit = handleSubmit(
    async (values) => {
      try {
        await onSave(values);
      } catch (error) {
        if (!applyApiFieldErrors(error, setError)) {
          showToast.error(error, t('userManagement.saveFailed'));
        }
      }
    },
    () => setFocusErrorRequestId((current) => current + 1),
  );

  return (
    <AppForm
      errors={fieldErrors}
      focusErrorRequestId={focusErrorRequestId}
      icon={isView
        ? 'eye-outline'
        : isEdit
          ? 'create-outline'
          : isInvite ? 'mail-outline' : 'person-add-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name as keyof ManagedUserFormValues)}
      onSubmit={isView ? undefined : submit}
      presentation="fullScreen"
      submitting={submitting}
      subtitle={t(
        isView
          ? 'userManagement.viewSubtitle'
          : isEdit
            ? 'userManagement.editSubtitle'
            : isInvite
              ? 'invitationManagement.subtitle'
              : 'userManagement.addSubtitle',
      )}
      title={t(
        isView
          ? 'userManagement.viewUser'
          : isEdit
            ? 'userManagement.editUser'
            : isInvite
              ? 'invitationManagement.sendInvitation'
              : 'userManagement.addUser',
      )}
      visible>
      <AppFormSection
        description={t('userManagement.identityDescription')}
        icon="person-outline"
        title={t('userManagement.identity')}>
        <Controller
          control={control}
          name="firstName"
          render={({ field }) => (
            <AppTextField
              editable={!submitting && !isView}
              label={t('userManagement.firstName')}
              leadingIcon="person-outline"
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
        <Controller
          control={control}
          name="lastName"
          render={({ field }) => (
            <AppTextField
              editable={!submitting && !isView}
              label={t('userManagement.lastName')}
              leadingIcon="person-outline"
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
        <Controller
          control={control}
          name="userName"
          render={({ field }) => (
            <AppTextField
              autoCapitalize="none"
              editable={!submitting && !isView}
              label={t('userManagement.userName')}
              leadingIcon="at-outline"
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
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <AppTextField
              autoCapitalize="none"
              editable={!submitting && !isView}
              keyboardType="email-address"
              label={t('userManagement.email')}
              leadingIcon="mail-outline"
              maxLength={100}
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

      <AppFormSection
        description={t('userManagement.accessDescription')}
        icon="shield-checkmark-outline"
        title={t('userManagement.access')}>
        <Controller
          control={control}
          name="roles"
          render={({ field }) => (
            <AppMultiSelectField
              disabled={submitting || isView}
              label={t('userManagement.roles')}
              leadingIcon="shield-checkmark-outline"
              name={field.name}
              onChange={field.onChange}
              options={roleOptions}
              placeholder={t('userManagement.selectRoles')}
              required
              values={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="companyIds"
          render={({ field }) => (
            <AppMultiSelectField
              disabled={submitting || isView}
              helperText={t('userManagement.companyAccessHint')}
              label={t('userManagement.companies')}
              leadingIcon="business-outline"
              name={field.name}
              onChange={(companyIds) => {
                field.onChange(companyIds);
                const defaultCompanyId = getValues('defaultCompanyId');
                if (!companyIds.includes(defaultCompanyId)) {
                  setValue('defaultCompanyId', companyIds[0] ?? 0, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              options={companyOptions}
              placeholder={t('userManagement.selectCompanies')}
              required
              values={field.value}
            />
          )}
        />
        <Controller
          control={control}
          name="defaultCompanyId"
          render={({ field }) => (
            <AppSelectField
              disabled={submitting || isView || defaultCompanyOptions.length === 0}
              label={t('userManagement.defaultCompany')}
              leadingIcon="home-outline"
              name={field.name}
              onChange={field.onChange}
              options={defaultCompanyOptions}
              placeholder={t('userManagement.selectDefaultCompany')}
              required
              value={field.value}
            />
          )}
        />
      </AppFormSection>

      {isAdd || isEdit ? (
        <AppFormSection
          description={t(isEdit
            ? 'userManagement.passwordChangeDescription'
            : 'userManagement.passwordDescription')}
          icon="key-outline"
          title={t(isEdit ? 'userManagement.passwordSettings' : 'userManagement.passwordSection')}>
          {isEdit ? (
            <AppButton
              fullWidth
              icon={showPasswordSection ? 'eye-off-outline' : 'key-outline'}
              onPress={() => {
                setShowPasswordSection((current) => !current);
                if (showPasswordSection) {
                  setValue('password', '', { shouldDirty: true, shouldValidate: false });
                  setValue('confirmPassword', '', { shouldDirty: true, shouldValidate: false });
                  clearErrors(['password', 'confirmPassword']);
                }
              }}
              variant={showPasswordSection ? 'secondary' : 'outline'}>
              {t(showPasswordSection ? 'userManagement.hidePassword' : 'userManagement.changePassword')}
            </AppButton>
          ) : null}
          {isAdd || showPasswordSection ? (
            <>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <AppTextField
                    editable={!submitting}
                    label={t('userManagement.password')}
                    leadingIcon="lock-closed-outline"
                    maxLength={50}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    ref={field.ref}
                    required
                    secureTextEntry
                    value={field.value}
                  />
                )}
              />
              {watchedPassword ? (
                <PasswordStrength value={passwordStrength} />
              ) : null}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <AppTextField
                    editable={!submitting}
                    label={t('userManagement.confirmPassword')}
                    leadingIcon="lock-closed-outline"
                    maxLength={50}
                    name={field.name}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    ref={field.ref}
                    required
                    secureTextEntry
                    value={field.value}
                  />
                )}
              />
            </>
          ) : null}
        </AppFormSection>
      ) : null}
    </AppForm>
  );
}

interface PasswordStrengthValue {
  score: number;
  label: string;
  checks: readonly { passed: boolean; label: string }[];
}

function PasswordStrength({ value }: { value: PasswordStrengthValue }) {
  const { theme } = useAppTheme();
  const color = value.score === 0
    ? theme.colors.disabled
    : value.score <= 2
      ? theme.colors.danger
      : value.score === 3
        ? theme.colors.warning
        : value.score === 4
          ? theme.colors.secondary
          : theme.colors.success;

  return (
    <View style={styles.passwordStrength}>
      <AppText style={{ color }} variant="caption" weight="700">
        {value.label}
      </AppText>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4, 5].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              { backgroundColor: level <= value.score ? color : theme.colors.border },
            ]}
          />
        ))}
      </View>
      <View style={styles.passwordChecks}>
        {value.checks.map((check) => (
          <View key={check.label} style={styles.passwordCheck}>
            <AppIcon
              color={check.passed ? color : theme.colors.disabled}
              name={check.passed ? 'checkmark-circle' : 'ellipse-outline'}
              size={15}
            />
            <AppText color="muted" variant="caption">{check.label}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function getPasswordStrength(
  password: string,
  t: TFunction,
): PasswordStrengthValue {
  const checks = [
    { passed: password.length >= 8, label: t('userManagement.passwordLength') },
    { passed: /[a-z]/.test(password), label: t('userManagement.passwordLowercase') },
    { passed: /[A-Z]/.test(password), label: t('userManagement.passwordUppercase') },
    { passed: /\d/.test(password), label: t('userManagement.passwordNumber') },
    { passed: /[^A-Za-z0-9]/.test(password), label: t('userManagement.passwordSymbol') },
  ];
  const score = checks.filter((check) => check.passed).length;
  const labels = [
    '',
    t('userManagement.passwordVeryWeak'),
    t('userManagement.passwordWeak'),
    t('userManagement.passwordMedium'),
    t('userManagement.passwordStrong'),
    t('userManagement.passwordVeryStrong'),
  ];
  return {
    score,
    label: labels[score],
    checks,
  };
}

function createDefaults(user: ManagedUser | null, currentCompanyId: number): ManagedUserFormValues {
  if (!user) {
    return {
      firstName: '',
      lastName: '',
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: [],
      companyIds: currentCompanyId > 0 ? [currentCompanyId] : [],
      defaultCompanyId: currentCompanyId,
    };
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    email: user.email,
    password: '',
    confirmPassword: '',
    roles: [...user.roles],
    companyIds: [...user.companyIds],
    defaultCompanyId: user.defaultCompanyId ?? user.companyIds[0] ?? 0,
  };
}

type SetFieldError = (
  name: keyof ManagedUserFormValues,
  error: { type: string; message: string },
) => void;

function applyApiFieldErrors(error: unknown, setError: SetFieldError): boolean {
  if (!(error instanceof ApiError) || !error.problem?.errors) return false;

  const fieldMap: Record<string, keyof ManagedUserFormValues> = {
    firstname: 'firstName',
    lastname: 'lastName',
    username: 'userName',
    email: 'email',
    password: 'password',
    newpassword: 'password',
    confirmpassword: 'confirmPassword',
    roles: 'roles',
    companyids: 'companyIds',
    defaultcompanyid: 'defaultCompanyId',
  };
  let mapped = false;

  for (const [apiField, messages] of Object.entries(error.problem.errors)) {
    const field = fieldMap[apiField.replace(/^request\./i, '').toLowerCase()];
    const message = messages[0];
    if (!field || !message) continue;
    setError(field, { type: 'server', message });
    mapped = true;
  }

  return mapped;
}

const styles = StyleSheet.create({
  passwordStrength: { gap: 8 },
  strengthBars: { flexDirection: 'row', gap: 4 },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  passwordChecks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  passwordCheck: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
