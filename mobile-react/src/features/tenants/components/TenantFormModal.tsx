import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { toFormErrorMap, useZodForm } from '@/src/core/validation';
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantFormState,
} from '@/src/features/tenants/types/tenant';
import { createTenantValidationSchema } from '@/src/features/tenants/validation/tenantValidation';
import {
  AppDateTimeField,
  AppForm,
  type AppIconName,
  AppSelectField,
  AppSwitchField,
  AppTextField,
} from '@/src/shared/components';

const statusIcons = {
  free: 'gift-outline',
  trial: 'flask-outline',
  active: 'checkmark-circle-outline',
  pastDue: 'time-outline',
  suspended: 'pause-circle-outline',
  expired: 'hourglass-outline',
  cancelled: 'close-circle-outline',
} as const satisfies Record<SubscriptionStatus, AppIconName>;

interface TenantFormModalProps {
  form: TenantFormState;
  isEdit: boolean;
  loading: boolean;
  onClose: () => void;
  onSave: (form: TenantFormState) => void | Promise<void>;
}

export function TenantFormModal({
  form,
  isEdit,
  loading,
  onClose,
  onSave,
}: TenantFormModalProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const validationSchema = useMemo(
    () =>
      createTenantValidationSchema({
        required: t('validation.required'),
        maxLength: (count) => t('validation.maxLength', { count }),
        invalidIdentifier: t('validation.invalidIdentifier'),
        invalidOption: t('validation.invalidOption'),
        invalidDate: t('validation.invalidDate'),
        endDateBeforeStart: t('validation.endDateBeforeStart'),
        wholeNumberMin: (minimum) => t('validation.wholeNumberMin', { minimum }),
        invalidEmail: t('validation.invalidEmail'),
      }),
    [t],
  );
  const {
    clearErrors,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useZodForm(validationSchema, { defaultValues: form });

  const fieldErrors = useMemo(() => toFormErrorMap<TenantFormState>(errors), [errors]);
  const subscriptionStartedOn = watch('subscriptionStartedOn');
  const submitting = loading || isSubmitting;
  const submitForm = handleSubmit(onSave);

  return (
    <AppForm
      contentContainerStyle={styles.content}
      errors={fieldErrors}
      icon={isEdit ? 'create-outline' : 'business-outline'}
      isDirty={isDirty}
      onCancel={onClose}
      onClearFieldError={(name) => clearErrors(name as keyof TenantFormState)}
      onSubmit={submitForm}
      presentation="fullScreen"
      style={styles.form}
      submitting={submitting}
      subtitle={t(
        isEdit
          ? 'tenantManagement.editTenantDescription'
          : 'tenantManagement.addTenantDescription',
      )}
      title={t(isEdit ? 'tenantManagement.editTenant' : 'tenantManagement.addTenant')}
      visible>
      <Controller
        control={control}
        name="identifier"
        render={({ field }) => (
          <AppTextField
            autoCapitalize="none"
            editable={!submitting}
            label={t('tenantManagement.identifier')}
            leadingIcon="key-outline"
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
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <AppTextField
            editable={!submitting}
            label={t('tenantManagement.name')}
            leadingIcon="business-outline"
            maxLength={200}
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
        name="planName"
        render={({ field }) => (
          <AppSelectField
            disabled={submitting}
            label={t('tenantManagement.plan')}
            leadingIcon="layers-outline"
            name={field.name}
            onChange={field.onChange}
            options={[
              { value: 'Free', label: t('tenantManagement.plans.free'), icon: 'gift-outline' },
              { value: 'Basic', label: t('tenantManagement.plans.basic'), icon: 'rocket-outline' },
              {
                value: 'Professional',
                label: t('tenantManagement.plans.professional'),
                icon: 'briefcase-outline',
              },
              {
                value: 'Enterprise',
                label: t('tenantManagement.plans.enterprise'),
                icon: 'business-outline',
              },
            ]}
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="subscriptionStatus"
        render={({ field }) => (
          <AppSelectField
            disabled={submitting}
            label={t('tenantManagement.status')}
            name={field.name}
            onChange={field.onChange}
            options={subscriptionStatuses.map((status) => ({
              value: status,
              label: t(`tenantManagement.statuses.${status}`),
              icon: statusIcons[status],
            }))}
            required
            value={field.value}
          />
        )}
      />

      <View style={[styles.twoColumns, { direction }]}>
        <View style={styles.columnField}>
          <Controller
            control={control}
            name="subscriptionStartedOn"
            render={({ field }) => (
              <AppDateTimeField
                disabled={submitting}
                label={t('tenantManagement.startsOn')}
                name={field.name}
                onChangeValue={field.onChange}
                required
                showClearButton={false}
                value={field.value}
              />
            )}
          />
        </View>
        <View style={styles.columnField}>
          <Controller
            control={control}
            name="subscriptionEndsOn"
            render={({ field }) => (
              <AppDateTimeField
                disabled={submitting}
                label={t('tenantManagement.endsOn')}
                minimumDate={subscriptionStartedOn
                  ? new Date(`${subscriptionStartedOn}T12:00:00`)
                  : undefined}
                name={field.name}
                onChangeValue={field.onChange}
                required
                value={field.value}
              />
            )}
          />
        </View>
      </View>

      <View style={[styles.twoColumns, { direction }]}>
        <View style={styles.columnField}>
          <Controller
            control={control}
            name="maxAdmins"
            render={({ field }) => (
              <AppTextField
                editable={!submitting}
                label={t('tenantManagement.maxAdmins')}
                leadingIcon="shield-checkmark-outline"
                maxLength={10}
                minValue={1}
                name={field.name}
                numeric
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                ref={field.ref}
                required
                value={field.value}
              />
            )}
          />
        </View>
        <View style={styles.columnField}>
          <Controller
            control={control}
            name="maxUsers"
            render={({ field }) => (
              <AppTextField
                editable={!submitting}
                label={t('tenantManagement.maxUsers')}
                leadingIcon="people-outline"
                maxLength={10}
                minValue={0}
                name={field.name}
                numeric
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                ref={field.ref}
                required
                value={field.value}
              />
            )}
          />
        </View>
      </View>

      <Controller
        control={control}
        name="billingEmail"
        render={({ field }) => (
          <AppTextField
            autoCapitalize="none"
            editable={!submitting}
            keyboardType="email-address"
            label={t('tenantManagement.billingEmail')}
            leadingIcon="mail-outline"
            maxLength={256}
            name={field.name}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            ref={field.ref}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="contactName"
        render={({ field }) => (
          <AppTextField
            editable={!submitting}
            label={t('tenantManagement.contactName')}
            leadingIcon="person-outline"
            maxLength={200}
            name={field.name}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            ref={field.ref}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="contactPhone"
        render={({ field }) => (
          <AppTextField
            editable={!submitting}
            keyboardType="phone-pad"
            label={t('tenantManagement.contactPhone')}
            leadingIcon="call-outline"
            maxLength={32}
            name={field.name}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            ref={field.ref}
            value={field.value}
          />
        )}
      />
      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <AppTextField
            editable={!submitting}
            label={t('tenantManagement.notes')}
            leadingIcon="document-text-outline"
            maxLength={2000}
            multiline
            name={field.name}
            numberOfLines={4}
            onBlur={field.onBlur}
            onChangeText={field.onChange}
            ref={field.ref}
            style={styles.notesInput}
            textAlignVertical="top"
            value={field.value}
          />
        )}
      />

      <Controller
        control={control}
        name="isActive"
        render={({ field }) => (
          <AppSwitchField
            description={t(field.value ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
            disabled={submitting}
            icon="power-outline"
            label={t('tenantManagement.tenantEnabled')}
            name={field.name}
            onValueChange={field.onChange}
            value={field.value}
          />
        )}
      />
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
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  columnField: {
    flex: 1,
    minWidth: 240,
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
  },
});
