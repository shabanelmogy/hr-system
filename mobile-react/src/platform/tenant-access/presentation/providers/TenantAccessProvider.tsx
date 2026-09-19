import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';

import { configureAxiosReadOnlyAccess } from '@/src/core/api';
import { useAppTheme } from '@/src/core/theme';
import { useAuth } from '@/src/platform/auth';
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
  const { theme } = useAppTheme();
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
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      const endsAt = parseEndTime(session?.tenantSubscriptionEndsOn);
      if (endsAt === null) {
        setSubscriptionEnded(false);
        return;
      }
      const remaining = endsAt - Date.now();
      if (remaining <= 0) {
        setSubscriptionEnded(true);
        return;
      }
      setSubscriptionEnded(false);
      // JavaScript timers are implementation-limited. Recalculate after each
      // bounded interval so subscriptions longer than the timer limit never
      // enter read-only mode prematurely.
      timer = setTimeout(schedule, Math.min(remaining + 1_000, maxTimerDelayMs));
    };

    schedule();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') schedule();
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      subscription.remove();
    };
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
        iconColor={theme.colors.warning}
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
