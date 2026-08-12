import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import {
  AppCard,
  AppIcon,
  AppIconButton,
  AppStatusBadge,
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
  group: PermissionGroup;
  onSetModule: (group: PermissionGroup, selected: boolean) => void;
  onToggle: (claimIndex: number) => void;
}

export function PermissionModuleCard({
  disabled,
  group,
  onSetModule,
  onToggle,
}: PermissionModuleCardProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();
  const selectedCount = group.claims.filter(({ claim }) => claim.isSelected).length;
  const allSelected = selectedCount === group.claims.length && group.claims.length > 0;

  return (
    <AppCard padding="md" style={styles.card}>
      <View style={[styles.header, { direction }]}>
        <View
          style={[
            styles.moduleIcon,
            { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm },
          ]}>
          <AppIcon color={theme.colors.primary} name="apps-outline" size={22} />
        </View>
        <View style={styles.moduleText}>
          <AppText variant="label" weight="800">
            {getPermissionModuleLabel(group.module, t)}
          </AppText>
          <AppText color="muted" variant="caption">
            {group.module}
          </AppText>
        </View>
        <AppStatusBadge
          color={selectedCount ? theme.colors.success : theme.colors.textMuted}
          label={t('roleManagement.selectedOfTotal', {
            selected: selectedCount,
            total: group.claims.length,
          })}
          variant="outlined"
        />
        {!disabled ? (
          <AppIconButton
            color={allSelected ? theme.colors.danger : theme.colors.success}
            icon={allSelected ? 'remove-circle-outline' : 'checkmark-circle-outline'}
            label={t(allSelected ? 'roleManagement.clearModule' : 'roleManagement.selectModule')}
            onPress={() => onSetModule(group, !allSelected)}
          />
        ) : null}
      </View>

      <View style={styles.permissions}>
        {group.claims.map(({ action, claim, index }) => (
          <AppSwitchField
            description={claim.displayValue}
            disabled={disabled}
            icon={getActionIcon(action)}
            key={claim.displayValue}
            label={getPermissionActionLabel(action, t)}
            onValueChange={() => onToggle(index)}
            value={claim.isSelected}
          />
        ))}
      </View>
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
  card: { gap: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 9,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleText: { flex: 1, minWidth: 110, gap: 1 },
  permissions: { gap: 9 },
});
