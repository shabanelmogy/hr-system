import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/features/auth';
import { AppIcon, AppText } from '@/src/shared/components';

export function TenantPlanBadge() {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const planName = session?.tenantPlanName?.trim() ?? '';
  const isSuperAdmin = session?.roles.some(
    (role) => role.trim().toLowerCase() === 'super_admin',
  ) ?? false;

  if (!planName || isSuperAdmin) return null;

  return (
    <View
      accessibilityLabel={planName}
      style={[
        styles.badge,
        {
          direction,
          backgroundColor: `${theme.colors.warning}1A`,
          borderColor: theme.colors.warning,
        },
      ]}>
      <AppIcon color={theme.colors.warning} name="diamond-outline" size={16} />
      <AppText
        numberOfLines={1}
        style={[styles.label, { color: theme.colors.text }]}
        variant="caption"
        weight="800">
        {planName}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    maxWidth: 160,
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
