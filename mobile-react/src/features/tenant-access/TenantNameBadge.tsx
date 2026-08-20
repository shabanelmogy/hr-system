import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/features/auth';
import { AppIcon, AppText } from '@/src/shared/components';

export function TenantNameBadge() {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const tenantName = session?.tenantName?.trim() ?? '';
  const isSuperAdmin = session?.roles.some(
    (role) => role.trim().toLowerCase() === 'super_admin',
  ) ?? false;

  if (!tenantName || isSuperAdmin) return null;

  return (
    <View
      accessibilityLabel={tenantName}
      style={[
        styles.badge,
        {
          direction,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.primary,
        },
      ]}>
      <AppIcon color={theme.colors.primary} name="business-outline" size={16} />
      <AppText
        numberOfLines={1}
        style={[styles.label, { color: theme.colors.text }]}
        variant="caption"
        weight="800">
        {tenantName}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    maxWidth: 220,
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
  },
  label: {
    flexShrink: 1,
  },
});
