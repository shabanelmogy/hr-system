import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppDivider,
  AppIcon,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';
import type { RoleOption } from '../../types/administration';

interface RoleCardProps {
  actions: ReactNode;
  role: RoleOption;
}

export function RoleCard({ actions, role }: RoleCardProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard padding="md" style={styles.card} variant="elevated">
      <View style={[styles.header, { direction }]}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderRadius: theme.radius.sm,
            },
          ]}>
          <AppIcon color={theme.colors.primary} name="shield-checkmark-outline" size={24} />
        </View>
        <View style={styles.title}>
          <AppText numberOfLines={2} variant="titleSmall">
            {role.name}
          </AppText>
          <AppText color="muted" variant="caption">
            {t('roleManagement.roleCardLabel')}
          </AppText>
        </View>
        <AppStatusBadge
          color={role.isDeleted ? theme.colors.danger : theme.colors.success}
          icon={role.isDeleted ? 'pause-circle-outline' : 'checkmark-circle-outline'}
          label={t(role.isDeleted ? 'roleManagement.disabled' : 'roleManagement.active')}
        />
      </View>
      <AppDivider />
      <View style={styles.actions}>{actions}</View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 142,
    flexGrow: 1,
    flexBasis: 280,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, gap: 2 },
  actions: { alignItems: 'center' },
});
