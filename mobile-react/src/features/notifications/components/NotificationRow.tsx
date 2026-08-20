import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useLocalization } from '@/src/core/localization';
import { useAppTheme } from '@/src/core/theme';
import type { AppNotification } from '@/src/features/notifications/types/notification';
import {
  formatRelativeTime,
  normalizeSeverity,
  translateNotification,
} from '@/src/features/notifications/utils/notification-presentation';
import {
  AppCard,
  AppIcon,
  type AppIconName,
  AppIconButton,
  AppStatusBadge,
  AppText,
} from '@/src/shared/components';

interface NotificationRowProps {
  notification: AppNotification;
  busy?: boolean;
  onDismiss: (notification: AppNotification) => void;
  onToggleRead: (notification: AppNotification) => void;
  onPress?: (notification: AppNotification) => void;
}

export function NotificationRow({ notification, busy = false, onDismiss, onToggleRead, onPress }: NotificationRowProps) {
  const { t } = useTranslation();
  const { direction, isRTL } = useLocalization();
  const { theme } = useAppTheme();
  const { title, message } = translateNotification(notification, t);
  const unread = notification.readOn === null;
  const severity = normalizeSeverity(notification.severity);
  const accent = severity === 'critical' ? theme.colors.danger
    : severity === 'warning' ? theme.colors.warning
      : severity === 'success' ? theme.colors.success
        : theme.colors.primary;
  const severityIcon: AppIconName = severity === 'critical' ? 'alert-circle-outline'
    : severity === 'warning' ? 'warning-outline'
      : severity === 'success' ? 'checkmark-circle-outline'
        : 'information-circle-outline';
  const relativeTime = formatRelativeTime(notification.createdOn, t);
  const label = `${title}. ${message}. ${relativeTime}.`;

  return (
    <AppCard
      accessibilityLabel={label}
      accessibilityState={{ selected: unread }}
      disabled={busy}
      onPress={onPress ? () => onPress(notification) : undefined}
      padding="sm"
      style={[styles.card, unread && { borderColor: accent, borderWidth: 1.5 }]}
      variant={unread ? 'filled' : 'outlined'}>
      <View style={[styles.header, { direction }]}>
        <View
          style={[
            styles.severityIcon,
            { backgroundColor: `${accent}1A`, borderRadius: theme.radius.full },
          ]}>
            <AppIcon color={accent} name={severityIcon} size={18} />
        </View>
        <View style={styles.body}>
          <View style={[styles.titleRow, { direction }]}>
            <AppText
              align={isRTL ? 'right' : 'left'}
              numberOfLines={2}
              style={styles.title}
              variant="label"
              weight={unread ? '800' : '600'}>
              {title || t('notifications.untitled')}
            </AppText>
            {unread ? (
              <View
                accessibilityLabel={t('notifications.unread')}
                style={[styles.unreadDot, { backgroundColor: accent }]}
              />
            ) : null}
          </View>
          <AppText align={isRTL ? 'right' : 'left'} color="muted" numberOfLines={2} variant="bodySmall">
            {message || notification.eventType}
          </AppText>
        </View>
        {onPress ? (
          <AppIcon
            color={theme.colors.textMuted}
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={19}
          />
        ) : null}
      </View>
      <View style={[styles.footer, { direction }]}>
        <View style={[styles.meta, { direction }]}> 
          <AppIcon color={theme.colors.textMuted} name="time-outline" size={14} />
          <AppText color="muted" variant="caption">{relativeTime}</AppText>
          <AppStatusBadge
            color={unread ? theme.colors.primary : theme.colors.textMuted}
            icon={unread ? 'mail-unread-outline' : 'mail-open-outline'}
            label={unread ? t('notifications.unread') : t('notifications.read')}
            style={styles.readStatus}
            variant="soft"
          />
        </View>
        <View style={[styles.actions, { direction }]}>
          <AppIconButton
            disabled={busy}
            icon={unread ? 'mail-open-outline' : 'mail-unread-outline'}
            label={unread
              ? t('notifications.markRead')
              : t('notifications.markUnread')}
            onPress={(event) => {
              event.stopPropagation();
              onToggleRead(notification);
            }}
            size={18}
            style={styles.actionButton}
          />
          <AppIconButton
            color={theme.colors.danger}
            disabled={busy}
            icon="trash-outline"
            label={t('notifications.dismiss')}
            onPress={(event) => {
              event.stopPropagation();
              onDismiss(notification);
            }}
            size={18}
            style={styles.actionButton}
          />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  severityIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0, gap: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, minWidth: 0 },
  unreadDot: { width: 9, height: 9, borderRadius: 99 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, flex: 1 },
  readStatus: { minHeight: 22, paddingHorizontal: 7 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { width: 34, height: 34 },
});
