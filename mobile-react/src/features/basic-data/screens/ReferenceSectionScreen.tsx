import { StyleSheet, View } from 'react-native';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  isAuthorized,
  type PermissionMatchMode,
  type PermissionString,
  useAuth,
} from '@/src/features/auth';
import { AppCard, AppIcon, type AppIconName, AppScreen, AppText } from '@/src/shared/components';

export interface ReferenceSectionItem {
  label: string;
  icon: AppIconName;
  roles?: readonly string[];
  permissions?: readonly PermissionString[];
  permissionMode?: PermissionMatchMode;
}

interface ReferenceSectionScreenProps {
  title: string;
  description: string;
  items: readonly ReferenceSectionItem[];
}

export function ReferenceSectionScreen({
  title,
  description,
  items,
}: ReferenceSectionScreenProps) {
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const visibleItems = items.filter((item) =>
    isAuthorized(session, {
      roles: item.roles,
      permissions: item.permissions,
      permissionMode: item.permissionMode,
    }),
  );

  return (
    <AppScreen edges={['left', 'right', 'bottom']}>
      <View style={styles.heading}>
        <AppText variant="title">{title}</AppText>
        <AppText color="muted" variant="bodySmall">
          {description}
        </AppText>
      </View>
      <AppCard style={styles.list}>
        {visibleItems.map((item) => (
          <View
            key={item.label}
            style={[
              styles.row,
              { direction, borderBottomColor: theme.colors.border },
            ]}>
            <AppIcon color={theme.colors.primary} name={item.icon} size={22} />
            <AppText style={styles.label} variant="label">
              {item.label}
            </AppText>
            <AppIcon
              color={theme.colors.textMuted}
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={19}
            />
          </View>
        ))}
      </AppCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 4,
    marginBottom: 20,
  },
  list: {
    paddingVertical: 0,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
  },
});
