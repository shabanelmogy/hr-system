import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import {
  subscriptionStatuses,
  type SubscriptionStatus,
  type TenantFormErrors,
  type TenantFormState,
} from '@/src/features/tenants/types/tenant';
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
  form: TenantFormState | null;
  errors: TenantFormErrors;
  isEdit: boolean;
  error: string | null;
  loading: boolean;
  onChange: (form: TenantFormState) => void;
  onClearFieldError: (field: keyof TenantFormState) => void;
  onClose: () => void;
  onSave: () => void | Promise<void>;
}

export function TenantFormModal({
  form,
  errors,
  isEdit,
  error,
  loading,
  onChange,
  onClearFieldError,
  onClose,
  onSave,
}: TenantFormModalProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();

  if (!form) return null;

  const set = <Key extends keyof TenantFormState>(key: Key, value: TenantFormState[Key]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <AppForm
      contentContainerStyle={styles.content}
      errors={errors}
      icon={isEdit ? 'create-outline' : 'business-outline'}
      onCancel={onClose}
      onClearFieldError={(name) => onClearFieldError(name as keyof TenantFormState)}
      onSubmit={onSave}
      presentation="fullScreen"
      serverError={error}
      style={styles.form}
      submitting={loading}
      subtitle={t(
        isEdit
          ? 'tenantManagement.editTenantDescription'
          : 'tenantManagement.addTenantDescription',
      )}
      title={t(isEdit ? 'tenantManagement.editTenant' : 'tenantManagement.addTenant')}
      visible>
          <AppTextField
            autoCapitalize="none"
            editable={!loading}
            label={t('tenantManagement.identifier')}
            leadingIcon="key-outline"
            maxLength={100}
            name="identifier"
            onChangeText={(value) => set('identifier', value)}
            required
            value={form.identifier}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.name')}
            leadingIcon="business-outline"
            maxLength={200}
            name="name"
            onChangeText={(value) => set('name', value)}
            required
            value={form.name}
          />
          <AppSelectField
            disabled={loading}
            label={t('tenantManagement.plan')}
            leadingIcon="layers-outline"
            name="planName"
            onChange={(value) => set('planName', value)}
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
            value={form.planName}
          />

          <AppSelectField
            disabled={loading}
            label={t('tenantManagement.status')}
            name="subscriptionStatus"
            onChange={(value) => set('subscriptionStatus', value)}
            options={subscriptionStatuses.map((status) => ({
              value: status,
              label: t(`tenantManagement.statuses.${status}`),
              icon: statusIcons[status],
            }))}
            required
            value={form.subscriptionStatus}
          />

          <View style={[styles.twoColumns, { direction }]}>
            <View style={styles.columnField}>
              <AppDateTimeField
                disabled={loading}
                label={t('tenantManagement.startsOn')}
                name="subscriptionStartedOn"
                onChangeValue={(value) => set('subscriptionStartedOn', value)}
                required
                showClearButton={false}
                value={form.subscriptionStartedOn}
              />
            </View>
            <View style={styles.columnField}>
              <AppDateTimeField
                disabled={loading}
                label={t('tenantManagement.endsOn')}
                minimumDate={form.subscriptionStartedOn
                  ? new Date(`${form.subscriptionStartedOn}T12:00:00`)
                  : undefined}
                onChangeValue={(value) => set('subscriptionEndsOn', value)}
                name="subscriptionEndsOn"
                value={form.subscriptionEndsOn}
              />
            </View>
          </View>

          <View style={[styles.twoColumns, { direction }]}>
            <View style={styles.columnField}>
              <AppTextField
                editable={!loading}
                label={t('tenantManagement.maxAdmins')}
                leadingIcon="shield-checkmark-outline"
                maxLength={10}
                minValue={0}
                numeric
                name="maxAdmins"
                onChangeText={(value) => set('maxAdmins', value)}
                required
                value={form.maxAdmins}
              />
            </View>
            <View style={styles.columnField}>
              <AppTextField
                editable={!loading}
                label={t('tenantManagement.maxUsers')}
                leadingIcon="people-outline"
                maxLength={10}
                minValue={0}
                numeric
                name="maxUsers"
                onChangeText={(value) => set('maxUsers', value)}
                required
                value={form.maxUsers}
              />
            </View>
          </View>

          <AppTextField
            autoCapitalize="none"
            editable={!loading}
            keyboardType="email-address"
            label={t('tenantManagement.billingEmail')}
            leadingIcon="mail-outline"
            maxLength={256}
            name="billingEmail"
            onChangeText={(value) => set('billingEmail', value)}
            value={form.billingEmail}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.contactName')}
            leadingIcon="person-outline"
            maxLength={200}
            name="contactName"
            onChangeText={(value) => set('contactName', value)}
            value={form.contactName}
          />
          <AppTextField
            editable={!loading}
            keyboardType="phone-pad"
            label={t('tenantManagement.contactPhone')}
            leadingIcon="call-outline"
            maxLength={32}
            name="contactPhone"
            onChangeText={(value) => set('contactPhone', value)}
            value={form.contactPhone}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.notes')}
            leadingIcon="document-text-outline"
            maxLength={2000}
            multiline
            name="notes"
            numberOfLines={4}
            onChangeText={(value) => set('notes', value)}
            style={styles.notesInput}
            textAlignVertical="top"
            value={form.notes}
          />

          <AppSwitchField
            description={t(form.isActive ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
            disabled={loading}
            icon="power-outline"
            label={t('tenantManagement.tenantEnabled')}
            name="isActive"
            onValueChange={(value) => set('isActive', value)}
            value={form.isActive}
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
