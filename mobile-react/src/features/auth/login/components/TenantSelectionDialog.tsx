import { StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { TenantSelectionResponse } from '@/src/features/auth/types/auth';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppIcon,
  AppModal,
  AppText,
} from '@/src/shared/components';

interface TenantSelectionDialogProps {
  selection: TenantSelectionResponse | null;
  error?: string | null;
  onCancel: () => void;
  onSelect: (tenantId: string) => Promise<void>;
}

export function TenantSelectionDialog({
  selection,
  error,
  onCancel,
  onSelect,
}: TenantSelectionDialogProps) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const [selectingTenantId, setSelectingTenantId] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState({ token: '', id: '' });
  const selectionToken = selection?.tenantSelectionToken ?? '';
  const selectedTenantId = selectedTenant.token === selectionToken
    ? selectedTenant.id
    : '';

  const handleContinue = async () => {
    if (selectingTenantId !== null || !selectedTenantId) return;
    setSelectingTenantId(selectedTenantId);
    try {
      await onSelect(selectedTenantId);
    } finally {
      setSelectingTenantId(null);
    }
  };

  return (
    <AppModal
      closeDisabled={selectingTenantId !== null}
      closeLabel={t('common.cancel')}
      footer={
        <View style={[styles.actions, { direction }]}>
          <AppButton
            disabled={selectingTenantId !== null}
            icon="close-outline"
            onPress={onCancel}
            style={styles.action}
            variant="ghost">
            {t('common.cancel')}
          </AppButton>
          <AppButton
            disabled={!selectedTenantId}
            icon={isRTL ? 'arrow-back-circle-outline' : 'arrow-forward-circle-outline'}
            loading={selectingTenantId !== null}
            onPress={() => void handleContinue()}
            style={styles.action}>
            {t('auth.continueToTenant')}
          </AppButton>
        </View>
      }
      onClose={onCancel}
      subtitle={t('auth.selectTenantDescription')}
      title={t('auth.selectTenant')}
      visible={selection !== null}>
      {error ? <AppAlert severity="error">{error}</AppAlert> : null}
      <View style={styles.list}>
        {selection?.tenants.map((tenant) => {
          const selected = selectedTenantId === tenant.id;
          return (
            <AppCard
              accessibilityLabel={tenant.name}
              accessibilityState={{ selected, disabled: selectingTenantId !== null }}
              disabled={selectingTenantId !== null}
              key={tenant.id}
              onPress={() => setSelectedTenant({ token: selectionToken, id: tenant.id })}
              padding="md"
              style={[
                styles.tenant,
                {
                  direction,
                  backgroundColor: selected ? theme.colors.surfaceMuted : theme.colors.background,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}>
              <View
                style={[
                  styles.icon,
                  { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
                ]}>
                <AppIcon color={theme.colors.primary} name="business-outline" size={22} />
              </View>
              <View style={styles.text}>
                <AppText variant="label">{tenant.name}</AppText>
                <AppText color="muted" variant="caption">{tenant.identifier}</AppText>
              </View>
              <AppIcon
                color={selected ? theme.colors.primary : theme.colors.textMuted}
                name={selected ? 'checkmark-circle' : isRTL ? 'chevron-back' : 'chevron-forward'}
                size={selected ? 21 : 19}
              />
            </AppCard>
          );
        })}
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  tenant: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  icon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  action: { minWidth: 120 },
});
