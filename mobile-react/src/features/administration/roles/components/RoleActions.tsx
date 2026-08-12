import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components';
import type { RoleOption } from '../../types/administration';

interface RoleActionsProps {
  canDelete: boolean;
  canEdit: boolean;
  onEdit: (role: RoleOption) => void;
  onManagePermissions: (role: RoleOption) => void;
  onToggle: (role: RoleOption) => void;
  onView: (role: RoleOption) => void;
  role: RoleOption;
}

export function RoleActions({
  canDelete,
  canEdit,
  onEdit,
  onManagePermissions,
  onToggle,
  onView,
  role,
}: RoleActionsProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.actions, { direction }]}>
      <AppIconButton
        color={theme.colors.secondary}
        icon="eye-outline"
        label={t('roleManagement.viewRole')}
        onPress={() => onView(role)}
      />
      {canEdit ? (
        <AppIconButton
          color={theme.colors.primary}
          icon="create-outline"
          label={t('roleManagement.editRole')}
          onPress={() => onEdit(role)}
        />
      ) : null}
      <AppIconButton
        color={theme.colors.accent}
        icon="key-outline"
        label={t('roleManagement.managePermissions')}
        onPress={() => onManagePermissions(role)}
      />
      {canDelete ? (
        <AppIconButton
          color={role.isDeleted ? theme.colors.success : theme.colors.danger}
          icon={role.isDeleted ? 'play-circle-outline' : 'pause-circle-outline'}
          label={t(role.isDeleted ? 'roleManagement.enable' : 'roleManagement.disable')}
          onPress={() => onToggle(role)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
});
