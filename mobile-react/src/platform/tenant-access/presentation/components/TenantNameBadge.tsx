import { useTranslation } from 'react-i18next';

import { useAuth } from '@/src/platform/auth';
import { AppContextBadge, type AppContextBadgeProps } from '@/src/shared/components';

export function TenantNameBadge({
  compact = false,
  iconOnly = false,
  tone = 'surface',
}: {
  compact?: boolean;
  iconOnly?: boolean;
  tone?: AppContextBadgeProps['tone'];
}) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const tenantName = session?.tenantName?.trim() ?? '';
  const isSuperAdmin = session?.roles.some(
    (role) => role.trim().toLowerCase() === 'super_admin',
  ) ?? false;

  if (!tenantName || isSuperAdmin) return null;

  return <AppContextBadge
    accent="accent"
    compact={compact}
    icon="layers-outline"
    iconOnly={iconOnly}
    label={t('auth.currentTenant')}
    tone={tone}
    value={tenantName}
  />;
}
