import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { UserInvitation } from '../../types/administration';
import { useAppTheme } from '@/src/core/theme';
import { AppButton, AppCard, AppStatusBadge, AppText } from '@/src/shared/components';

interface UserInvitationsPanelProps {
  canResend: boolean;
  canRevoke: boolean;
  invitations: readonly UserInvitation[];
  loading: boolean;
  onResend: (invitation: UserInvitation) => void;
  onRevoke: (invitation: UserInvitation) => void;
}

export function UserInvitationsPanel({ canResend, canRevoke, invitations, loading, onResend, onRevoke }: UserInvitationsPanelProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useAppTheme();
  const actionable = invitations.filter(
    (invitation) => invitation.status === 'pending' || invitation.status === 'expired',
  );

  return (
    <AppCard padding="md" style={styles.card} variant="outlined">
      <View style={styles.header}>
        <View style={styles.copy}>
          <AppText variant="titleSmall">{t('userManagement.pendingInvitations')}</AppText>
          <AppText color="muted" variant="bodySmall">{t('userManagement.pendingInvitationsDescription')}</AppText>
        </View>
        <AppStatusBadge color={theme.colors.warning} icon="mail-unread-outline" label={t('userManagement.pendingInvitationCount', { count: actionable.length })} />
      </View>
      {actionable.length === 0 ? (
        <AppText color="muted" variant="bodySmall">{t('userManagement.noPendingInvitations')}</AppText>
      ) : actionable.map((invitation) => (
        <View key={invitation.id} style={styles.row}>
          <View style={styles.copy}>
            <AppText weight="700">{`${invitation.firstName} ${invitation.lastName}`}</AppText>
            <AppText color="muted" variant="bodySmall">{invitation.email}</AppText>
            <AppText color="muted" variant="caption">{t('userManagement.invitationExpiresOn', { date: new Date(invitation.expiresOn).toLocaleString(i18n.language) })}</AppText>
          </View>
          <AppStatusBadge
            color={invitation.status === 'expired' ? theme.colors.danger : theme.colors.warning}
            icon={invitation.status === 'expired' ? 'time-outline' : 'mail-unread-outline'}
            label={t(invitation.status === 'expired'
              ? 'userManagement.invitationExpired'
              : 'userManagement.invitationPending')}
          />
          <View style={styles.actions}>
            {canResend ? <AppButton disabled={loading} icon="refresh-outline" onPress={() => onResend(invitation)} variant="outline">{t('userManagement.resendInvitation')}</AppButton> : null}
            {canRevoke ? <AppButton disabled={loading} icon="close-circle-outline" onPress={() => onRevoke(invitation)} variant="ghost">{t('userManagement.revokeInvitation')}</AppButton> : null}
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, marginTop: 16 },
  header: { alignItems: 'flex-start', flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  row: { borderTopWidth: StyleSheet.hairlineWidth, gap: 10, paddingTop: 12 },
  copy: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
