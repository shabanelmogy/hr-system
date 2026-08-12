import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppTheme } from '@/src/core/theme';
import { AppStatusBadge } from '@/src/shared/components/feedback/AppStatusBadge';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';

export function TenantReadOnlyBadge() {
  const { t } = useTranslation();
  const { theme } = useAppTheme();
  const { isReadOnly, notifyBlockedAction } = useAppReadOnly();

  if (!isReadOnly) return null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={notifyBlockedAction}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}>
      <AppStatusBadge
        color={theme.colors.warning}
        icon="lock-closed-outline"
        label={t('tenantAccess.readOnlyBadge')}
        variant="solid"
      />
    </Pressable>
  );
}
