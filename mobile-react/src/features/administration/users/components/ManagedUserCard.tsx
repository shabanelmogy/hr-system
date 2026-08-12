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
import type { ManagedUser } from '../../types/administration';
import { ManagedUserAvatar } from './ManagedUserAvatar';

interface ManagedUserCardProps {
  actions: ReactNode;
  defaultCompanyName: string;
  user: ManagedUser;
}

export function ManagedUserCard({ actions, defaultCompanyName, user }: ManagedUserCardProps) {
  const { t } = useTranslation();
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <AppCard padding="md" style={styles.card} variant="elevated">
      <View style={[styles.header, { direction }]}>
        <ManagedUserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          profilePicture={user.profilePicture}
          size={52}
        />
        <View style={styles.identity}>
          <AppText numberOfLines={1} variant="titleSmall">
            {[user.firstName, user.lastName].filter(Boolean).join(' ')}
          </AppText>
          <AppText color="muted" numberOfLines={1} variant="caption">
            @{user.userName}
          </AppText>
        </View>
      </View>

      <View style={[styles.statuses, { direction }]}>
        <AppStatusBadge
          color={user.isDisabled ? theme.colors.danger : theme.colors.success}
          icon={user.isDisabled ? 'pause-circle-outline' : 'checkmark-circle-outline'}
          label={t(user.isDisabled ? 'userManagement.disabled' : 'userManagement.active')}
        />
        <AppStatusBadge
          color={user.isLocked ? theme.colors.danger : theme.colors.success}
          icon={user.isLocked ? 'lock-closed-outline' : 'lock-open-outline'}
          label={t(user.isLocked ? 'userManagement.locked' : 'userManagement.unlocked')}
        />
      </View>

      <View style={styles.details}>
        <DetailRow icon="mail-outline" text={user.email} />
        <DetailRow
          icon="shield-checkmark-outline"
          text={user.roles.join(', ') || t('userManagement.none')}
        />
        <DetailRow
          icon="business-outline"
          text={`${defaultCompanyName} - ${t('userManagement.companyCount', {
            count: user.companyIds.length,
          })}`}
        />
      </View>

      <AppDivider />
      <View style={styles.actions}>{actions}</View>
    </AppCard>
  );
}

function DetailRow({ icon, text }: { icon: 'mail-outline' | 'shield-checkmark-outline' | 'business-outline'; text: string }) {
  const { direction } = useLocalization();
  const { theme } = useAppTheme();

  return (
    <View style={[styles.detailRow, { direction }]}>
      <AppIcon color={theme.colors.textMuted} name={icon} size={17} />
      <AppText color="muted" numberOfLines={2} style={styles.detailText} variant="bodySmall">
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 278,
    flexGrow: 1,
    flexBasis: 300,
    gap: 12,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  identity: { flex: 1, minWidth: 0, gap: 2 },
  statuses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  details: { gap: 9 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  detailText: { flex: 1, minWidth: 0 },
  actions: { alignItems: 'center' },
});
