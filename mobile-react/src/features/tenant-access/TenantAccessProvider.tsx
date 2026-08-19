import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';

import { configureAxiosReadOnlyAccess } from '@/src/core/api';
import { useAuth } from '@/src/features/auth';
import { AppButton } from '@/src/shared/components/controls/AppButton';
import { AppAlert } from '@/src/shared/components/feedback/AppAlert';
import { AppReadOnlyProvider } from '@/src/shared/contexts/AppReadOnlyContext';
import { AppModal } from '@/src/shared/components/surfaces/AppModal';
import { AppText } from '@/src/shared/components/typography/AppText';

const maxTimerDelayMs = 2_147_000_000;

export function TenantAccessProvider({ children }: PropsWithChildren) {
  const { refreshSession, session } = useAuth();
  const accessKey = [
    session?.tenantId,
    session?.tenantSubscriptionStatus,
    session?.tenantSubscriptionEndsOn,
    session?.tenantReadOnly,
  ].join(':');

  return (
    <TenantAccessState key={accessKey} refreshSession={refreshSession} session={session}>
      {children}
    </TenantAccessState>
  );
}

function TenantAccessState({
  children,
  refreshSession,
  session,
}: PropsWithChildren<{
  refreshSession: ReturnType<typeof useAuth>['refreshSession'];
  session: ReturnType<typeof useAuth>['session'];
}>) {
  const { t, i18n } = useTranslation();
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [serverReadOnly, setServerReadOnly] = useState(false);
  const [subscriptionEnded, setSubscriptionEnded] = useState(() => hasSubscriptionEnded(session));
  const isSuperAdmin = session?.roles.some(
    (role) => role.toLowerCase() === 'super_admin',
  ) ?? false;
  const isReadOnly = !isSuperAdmin && Boolean(
    session &&
      (serverReadOnly ||
        session.tenantReadOnly ||
        session.tenantSubscriptionStatus.toLowerCase() === 'expired' ||
        subscriptionEnded),
  );
  const showNotice = useCallback(() => setNoticeVisible(true), []);
  const handleServerBlocked = useCallback(() => {
    setServerReadOnly(true);
    setNoticeVisible(true);
  }, []);

  useEffect(() => {
    const endsAt = parseEndTime(session?.tenantSubscriptionEndsOn);
    if (endsAt === null || endsAt <= Date.now()) return;

    const timer = setTimeout(
      () => setSubscriptionEnded(true),
      Math.min(endsAt - Date.now() + 1_000, maxTimerDelayMs),
    );
    return () => clearTimeout(timer);
  }, [session?.tenantSubscriptionEndsOn]);

  useEffect(
    () => configureAxiosReadOnlyAccess({ isReadOnly: () => isReadOnly, onBlocked: handleServerBlocked }),
    [handleServerBlocked, isReadOnly],
  );

  useEffect(() => {
    if (!isReadOnly) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshSession().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [isReadOnly, refreshSession]);

  const formattedEndDate = session?.tenantSubscriptionEndsOn
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: 'long' }).format(
        new Date(session.tenantSubscriptionEndsOn),
      )
    : null;

  return (
    <AppReadOnlyProvider isReadOnly={isReadOnly} onBlockedAction={showNotice}>
      {children}
      <AppModal
        footer={(
          <AppButton
            fullWidth
            icon="close-outline"
            onPress={() => setNoticeVisible(false)}>
            {t('common.close')}
          </AppButton>
        )}
        icon="lock-closed-outline"
        iconColor="#D97706"
        onClose={() => setNoticeVisible(false)}
        title={t('tenantAccess.title')}
        visible={isReadOnly && noticeVisible}>
        <AppAlert severity="warning">{t('tenantAccess.description')}</AppAlert>
        {formattedEndDate ? (
          <AppText color="muted" variant="bodySmall">
            {t('tenantAccess.endedOn', { date: formattedEndDate })}
          </AppText>
        ) : null}
        <AppText variant="bodySmall">{t('tenantAccess.readOnlyExplanation')}</AppText>
      </AppModal>
    </AppReadOnlyProvider>
  );
}

function parseEndTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function hasSubscriptionEnded(
  session: ReturnType<typeof useAuth>['session'],
): boolean {
  const endsAt = parseEndTime(session?.tenantSubscriptionEndsOn);
  return endsAt !== null && endsAt <= Date.now();
}
