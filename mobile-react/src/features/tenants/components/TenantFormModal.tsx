import { Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  subscriptionStatuses,
  type TenantFormState,
} from '@/src/features/tenants/types/tenant';
import { AppButton, AppIcon, AppScreen, AppText, AppTextField } from '@/src/shared/components';

interface TenantFormModalProps {
  form: TenantFormState | null;
  isEdit: boolean;
  error: string | null;
  loading: boolean;
  onChange: (form: TenantFormState) => void;
  onClose: () => void;
  onSave: () => void;
}

export function TenantFormModal({
  form,
  isEdit,
  error,
  loading,
  onChange,
  onClose,
  onSave,
}: TenantFormModalProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  if (!form) return null;

  const set = <Key extends keyof TenantFormState>(key: Key, value: TenantFormState[Key]) =>
    onChange({ ...form, [key]: value });

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible>
      <AppScreen contentContainerStyle={styles.content}>
        <View style={[styles.header, { direction, borderBottomColor: theme.colors.border }]}>
          <View style={styles.headerTitle}>
            <AppText variant="titleSmall">
              {t(isEdit ? 'tenantManagement.editTenant' : 'tenantManagement.addTenant')}
            </AppText>
          </View>
          <Pressable
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            disabled={loading}
            hitSlop={8}
            onPress={onClose}
            style={styles.closeButton}>
            <AppIcon color={theme.colors.textMuted} name="close-outline" size={26} />
          </Pressable>
        </View>

        <View style={styles.form}>
          <AppTextField
            autoCapitalize="none"
            editable={!loading}
            label={t('tenantManagement.identifier')}
            onChangeText={(value) => set('identifier', value)}
            required
            value={form.identifier}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.name')}
            onChangeText={(value) => set('name', value)}
            required
            value={form.name}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.plan')}
            onChangeText={(value) => set('planName', value)}
            value={form.planName}
          />

          <View style={styles.fieldGroup}>
            <AppText variant="label">{t('tenantManagement.status')}</AppText>
            <View style={[styles.statuses, { direction }]}>
              {subscriptionStatuses.map((status) => {
                const selected = status === form.subscriptionStatus;
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, disabled: loading }}
                    disabled={loading}
                    key={status}
                    onPress={() => set('subscriptionStatus', status)}
                    style={[
                      styles.status,
                      {
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                        borderRadius: theme.radius.full,
                      },
                    ]}>
                    <AppText
                      style={{ color: selected ? theme.colors.onPrimary : theme.colors.text }}
                      variant="caption"
                      weight="600">
                      {t(`tenantManagement.statuses.${status}`)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.twoColumns, { direction }]}>
            <AppTextField
              editable={!loading}
              label={t('tenantManagement.startsOn')}
              onChangeText={(value) => set('subscriptionStartedOn', value)}
              placeholder="YYYY-MM-DD"
              required
              style={styles.ltrInput}
              value={form.subscriptionStartedOn}
            />
            <AppTextField
              editable={!loading}
              label={t('tenantManagement.endsOn')}
              onChangeText={(value) => set('subscriptionEndsOn', value)}
              placeholder="YYYY-MM-DD"
              style={styles.ltrInput}
              value={form.subscriptionEndsOn}
            />
          </View>

          <View style={[styles.twoColumns, { direction }]}>
            <AppTextField
              editable={!loading}
              keyboardType="number-pad"
              label={t('tenantManagement.maxAdmins')}
              onChangeText={(value) => set('maxAdmins', value)}
              value={form.maxAdmins}
            />
            <AppTextField
              editable={!loading}
              keyboardType="number-pad"
              label={t('tenantManagement.maxUsers')}
              onChangeText={(value) => set('maxUsers', value)}
              value={form.maxUsers}
            />
          </View>

          <AppTextField
            autoCapitalize="none"
            editable={!loading}
            keyboardType="email-address"
            label={t('tenantManagement.billingEmail')}
            onChangeText={(value) => set('billingEmail', value)}
            value={form.billingEmail}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.contactName')}
            onChangeText={(value) => set('contactName', value)}
            value={form.contactName}
          />
          <AppTextField
            editable={!loading}
            keyboardType="phone-pad"
            label={t('tenantManagement.contactPhone')}
            onChangeText={(value) => set('contactPhone', value)}
            value={form.contactPhone}
          />
          <AppTextField
            editable={!loading}
            label={t('tenantManagement.notes')}
            multiline
            numberOfLines={4}
            onChangeText={(value) => set('notes', value)}
            style={styles.notesInput}
            textAlignVertical="top"
            value={form.notes}
          />

          <View
            style={[
              styles.switchRow,
              {
                direction,
                backgroundColor: theme.colors.surfaceMuted,
                borderRadius: theme.radius.md,
              },
            ]}>
            <View style={styles.switchLabel}>
              <AppText variant="label">{t('tenantManagement.tenantEnabled')}</AppText>
              <AppText color="muted" variant="caption">
                {t(form.isActive ? 'tenantManagement.enabled' : 'tenantManagement.disabled')}
              </AppText>
            </View>
            <Switch
              disabled={loading}
              onValueChange={(value) => set('isActive', value)}
              trackColor={{ false: theme.colors.disabled, true: theme.colors.primary }}
              value={form.isActive}
            />
          </View>

          {error ? (
            <View
              accessibilityLiveRegion="assertive"
              style={[
                styles.error,
                { backgroundColor: theme.colors.surfaceMuted, borderColor: theme.colors.danger },
              ]}>
              <AppIcon color={theme.colors.danger} name="alert-circle-outline" size={20} />
              <AppText color="danger" style={styles.errorText} variant="bodySmall">
                {error}
              </AppText>
            </View>
          ) : null}

          <View style={[styles.actions, { direction }]}>
            <AppButton disabled={loading} onPress={onClose} style={styles.action} variant="outline">
              {t('common.cancel')}
            </AppButton>
            <AppButton loading={loading} onPress={onSave} style={styles.action}>
              {t('common.save')}
            </AppButton>
          </View>
        </View>
      </AppScreen>
    </Modal>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  statuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  status: {
    minHeight: 34,
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  twoColumns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  ltrInput: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  notesInput: {
    minHeight: 96,
    paddingTop: 12,
  },
  switchRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 12,
  },
  switchLabel: {
    flex: 1,
  },
  error: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStartWidth: 3,
    padding: 10,
  },
  errorText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  action: {
    flex: 1,
  },
});
