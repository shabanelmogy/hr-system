import type { TFunction } from 'i18next';

import { ROUTES, type AppRoute } from '@/src/core/constants/routes';
import type { AppNotification, NotificationSeverity } from '@/src/features/notifications/types/notification';

export type NormalizedNotificationSeverity = 'info' | 'success' | 'warning' | 'critical';

export function normalizeSeverity(severity: NotificationSeverity): NormalizedNotificationSeverity {
  if (severity === 2 || severity === 'Success') return 'success';
  if (severity === 3 || severity === 'Warning') return 'warning';
  if (severity === 4 || severity === 'Critical') return 'critical';
  return 'info';
}

export function translateNotification(notification: Pick<AppNotification, 'titleKey' | 'messageKey' | 'parameters' | 'eventType'>, t: TFunction) {
  return {
    title: t(notification.titleKey, {
      ...notification.parameters,
      defaultValue: humanizeKey(notification.titleKey || notification.eventType),
    }),
    message: t(notification.messageKey, {
      ...notification.parameters,
      defaultValue: humanizeKey(notification.messageKey || notification.eventType),
    }),
  };
}

export function formatRelativeTime(value: string, t: TFunction): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return '';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1_000));
  const units = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ] as const;
  const match = units.find(([, interval]) => elapsedSeconds >= interval);
  if (!match) return t('notifications.relativeTime.justNow');

  const [unit, interval] = match;
  return t(`notifications.relativeTime.${unit}`, {
    count: Math.max(1, Math.floor(elapsedSeconds / interval)),
  });
}

const notificationRouteMap: Readonly<Record<string, AppRoute>> = {
  '/administration/users': ROUTES.administration.root,
  '/basic-data/countries': ROUTES.basicData.countries,
  '/basic-data/states': ROUTES.basicData.states,
  '/basic-data/districts': ROUTES.basicData.districts,
  '/basic-data/address-types': ROUTES.basicData.addressTypes,
};

export function resolveNotificationActionRoute(value: string | null): AppRoute | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return notificationRouteMap[value] ?? null;
}

function humanizeKey(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[._-]+/g, ' ').trim();
}
