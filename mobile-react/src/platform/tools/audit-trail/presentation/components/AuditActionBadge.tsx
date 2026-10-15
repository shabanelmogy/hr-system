import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { AppStatusBadge, type AppIconName } from '@/src/shared/components';

import type { AuditAction } from '../../domain/models/audit-trail';
import { actionLabel } from './audit-trail-format';

const actionIcons: Record<AuditAction, AppIconName> = {
  Created: 'add-circle-outline',
  Modified: 'create-outline',
  Deleted: 'trash-outline',
  Restored: 'refresh-outline',
};

export function AuditActionBadge({ action }: { action: AuditAction }) {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const colors: Record<AuditAction, string> = {
    Created: theme.colors.success,
    Modified: theme.colors.primary,
    Deleted: theme.colors.danger,
    Restored: theme.colors.warning,
  };

  return <AppStatusBadge color={colors[action]} icon={actionIcons[action]} label={actionLabel(t, action)} />;
}
