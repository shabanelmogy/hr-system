import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppIcon,
  AppIconButton,
  AppSwitchField,
  AppText,
} from '@/src/shared/components';
import {
  getPermissionActionLabel,
  getPermissionModuleLabel,
  type PermissionGroup,
} from '../permission-groups';

interface PermissionModuleCardProps {
  disabled: boolean;
  expanded: boolean;
  group: PermissionGroup;
  onSetModule: (group: PermissionGroup, selected: boolean) => void;
  onToggle: (claimIndex: number) => void;
  onToggleExpanded: () => void;
}

export function PermissionModuleCard({
  disabled,
  expanded,
  group,
  onSetModule,
  onToggle,
  onToggleExpanded,
}: PermissionModuleCardProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const selectedCount = group.claims.filter(({ claim }) => claim.isSelected).length;
  const allSelected = selectedCount === group.claims.length && group.claims.length > 0;
  const moduleLabel = getPermissionModuleLabel(group.module, t);

  return (
    <AppCard padding="sm" style={styles.card}>
      <View style={[styles.header, { direction }]}>
        <Pressable
          accessibilityLabel={t(
            expanded ? 'roleManagement.collapseModule' : 'roleManagement.expandModule',
            { module: moduleLabel },
          )}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={onToggleExpanded}
          style={({ pressed }) => [
            styles.expandButton,
            { direction, opacity: pressed ? 0.7 : 1 },
          ]}>
          <View
            style={[
              styles.moduleIcon,
              { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
            ]}>
            <AppIcon color={theme.colors.primary} name="apps-outline" size={20} />
          </View>
          <View style={styles.moduleText}>
            <AppText numberOfLines={1} variant="label" weight="800">
              {moduleLabel}
            </AppText>
            <AppText color={selectedCount ? 'success' : 'muted'} variant="caption" weight="700">
              {t('roleManagement.selectedOfTotal', {
                selected: selectedCount,
                total: group.claims.length,
              })}
            </AppText>
          </View>
          <AppIcon
            color={theme.colors.textMuted}
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={19}
          />
        </Pressable>
        {!disabled ? (
          <AppIconButton
            color={allSelected ? theme.colors.danger : theme.colors.success}
            icon={allSelected ? 'remove-circle-outline' : 'checkmark-circle-outline'}
            label={t(allSelected ? 'roleManagement.clearModule' : 'roleManagement.selectModule')}
            onPress={() => onSetModule(group, !allSelected)}
          />
        ) : null}
      </View>

      {expanded ? (
        <View style={[styles.permissions, { borderTopColor: theme.colors.border }]}>
          {group.claims.map(({ action, claim, index }) => (
            <AppSwitchField
              disabled={disabled}
              icon={getActionIcon(action)}
              key={claim.displayValue}
              label={getPermissionActionLabel(action, t)}
              onValueChange={() => onToggle(index)}
              value={claim.isSelected}
            />
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

function getActionIcon(action: string) {
  switch (action.toLowerCase()) {
    case 'view':
      return 'eye-outline' as const;
    case 'create':
      return 'add-circle-outline' as const;
    case 'edit':
      return 'create-outline' as const;
    case 'delete':
      return 'trash-outline' as const;
    case 'restore':
      return 'refresh-outline' as const;
    case 'manage':
      return 'settings-outline' as const;
    case 'access':
      return 'log-in-outline' as const;
    case 'moderate':
      return 'shield-checkmark-outline' as const;
    default:
      return 'key-outline' as const;
  }
}

const styles = StyleSheet.create({
  card: { gap: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButton: {
    minHeight: 48,
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleText: { flex: 1, minWidth: 0, gap: 1 },
  permissions: {
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 6,
    paddingTop: 8,
  },
});
