import { useTranslation } from 'react-i18next';

import { type AppColors, useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/features/auth/context/AuthProvider';
import { AppStatusBadge, type AppIconName } from '@/src/shared/components';

type SubscriptionStatusKey =
  | 'free'
  | 'trial'
  | 'active'
  | 'pastDue'
  | 'suspended'
  | 'expired'
  | 'cancelled';

const statusAliases: Record<string, SubscriptionStatusKey> = {
  free: 'free',
  trial: 'trial',
  active: 'active',
  pastdue: 'pastDue',
  suspended: 'suspended',
  expired: 'expired',
  cancelled: 'cancelled',
  canceled: 'cancelled',
};

export function TenantSubscriptionStatusBadge() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { session } = useAuth();
  const rawStatus = session?.tenantSubscriptionStatus?.trim() ?? '';
  const isSuperAdmin = session?.roles.some(
    (role) => role.trim().toLowerCase() === 'super_admin',
  ) ?? false;

  if (!rawStatus || isSuperAdmin) return null;

  const statusKey = statusAliases[rawStatus.replace(/[\s_-]/g, '').toLowerCase()];
  const appearance = getStatusAppearance(statusKey, theme.colors);
  const label = statusKey
    ? t(`tenantManagement.statuses.${statusKey}`)
    : rawStatus;

  return (
    <AppStatusBadge
      color={appearance.color}
      icon={appearance.icon}
      label={label}
      variant="soft"
    />
  );
}

function getStatusAppearance(
  status: SubscriptionStatusKey | undefined,
  colors: AppColors,
): { color: string; icon: AppIconName } {
  switch (status) {
    case 'active':
      return { color: colors.success, icon: 'checkmark-circle-outline' };
    case 'free':
      return { color: colors.secondary, icon: 'gift-outline' };
    case 'trial':
      return { color: colors.primary, icon: 'time-outline' };
    case 'pastDue':
      return { color: colors.warning, icon: 'alert-circle-outline' };
    case 'suspended':
      return { color: colors.danger, icon: 'pause-circle-outline' };
    case 'expired':
    case 'cancelled':
      return { color: colors.danger, icon: 'close-circle-outline' };
    default:
      return { color: colors.textMuted, icon: 'information-circle-outline' };
  }
}
