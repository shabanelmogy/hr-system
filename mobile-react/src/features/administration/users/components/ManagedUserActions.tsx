import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import { AppIconButton } from '@/src/shared/components';
import type { ManagedUser } from '../../types/administration';

interface ManagedUserActionsProps {
  canManage: boolean;
  onEdit: (user: ManagedUser) => void;
  onRevokeSessions: (user: ManagedUser) => void;
  onToggle: (user: ManagedUser) => void;
  onUnlock: (user: ManagedUser) => void;
  onView: (user: ManagedUser) => void;
  user: ManagedUser;
}

export function ManagedUserActions({
  canManage,
  onEdit,
  onRevokeSessions,
  onToggle,
  onUnlock,
  onView,
  user,
}: ManagedUserActionsProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.actions, { direction }]}>
      <AppIconButton
        color={theme.colors.secondary}
        icon="eye-outline"
        label={t('userManagement.viewUser')}
        onPress={() => onView(user)}
      />
      {canManage ? (
        <AppIconButton
          color={theme.colors.primary}
          icon="create-outline"
          label={t('userManagement.editUser')}
          onPress={() => onEdit(user)}
        />
      ) : null}
      {canManage && user.isLocked ? (
        <AppIconButton
          color={theme.colors.warning}
          icon="lock-open-outline"
          label={t('userManagement.unlock')}
          onPress={() => onUnlock(user)}
        />
      ) : null}
      {canManage ? (
        <AppIconButton
          color={user.isDisabled ? theme.colors.success : theme.colors.danger}
          icon={user.isDisabled ? 'play-circle-outline' : 'pause-circle-outline'}
          label={t(user.isDisabled ? 'userManagement.enable' : 'userManagement.disable')}
          onPress={() => onToggle(user)}
        />
      ) : null}
      {canManage ? (
        <AppIconButton
          color={theme.colors.danger}
          icon="exit-outline"
          label={t('userManagement.revokeSessions')}
          onPress={() => onRevokeSessions(user)}
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
