import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

import { offlineScopeKey, subscribeToOfflineSyncRequests, useConnectivity } from '@/src/core/offline';
import { useAuth } from '@/src/platform/auth';
import { useOfflineOperationsPolicy } from '@/src/platform/offline-operations';
import { useAppReadOnly } from '@/src/shared/contexts/AppReadOnlyContext';
import { useWorkforcePlanDraftPilot } from '@/src/modules/hr/workforce-planning';

/**
 * Company-wide sync trigger. Feature screens never own replay lifecycle; a
 * route transition, reconnect, foreground event, or app startup can drain the
 * same scoped queue once server authentication and a fresh policy are present.
 */
export function OfflineSyncCoordinator() {
  const { isOnline } = useConnectivity();
  const { status, isServerAuthenticated } = useAuth();
  const { isReadOnly } = useAppReadOnly();
  const policy = useOfflineOperationsPolicy();
  const { pilot, scope } = useWorkforcePlanDraftPilot();
  const allowed = policy.loaded
    && policy.policy?.status === 'ready'
    && Boolean(policy.snapshot);
  const runtime = useRef({
    authenticated: false,
    readOnly: true,
    scopeKey: null as string | null,
  });
  useEffect(() => {
    runtime.current = {
      authenticated: isServerAuthenticated && status === 'authenticated' && allowed,
      readOnly: isReadOnly,
      scopeKey: scope ? offlineScopeKey(scope) : null,
    };
  }, [allowed, isReadOnly, isServerAuthenticated, scope, status]);

  useEffect(() => {
    if (!pilot || !scope || !isOnline || !allowed || !isServerAuthenticated
      || status !== 'authenticated' || isReadOnly) return undefined;
    let disposed = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const clearRetryTimer = () => {
      if (retryTimer) clearTimeout(retryTimer);
      retryTimer = undefined;
    };
    const schedule = async () => {
      clearRetryTimer();
      const nextAttemptAt = await pilot.nextAttemptAt(scope);
      if (disposed || !nextAttemptAt) return;
      const delay = Math.max(250, Math.min(2_147_000_000, Date.parse(nextAttemptAt) - Date.now()));
      retryTimer = setTimeout(() => { void run(); }, Number.isFinite(delay) ? delay : 250);
    };
    const run = async () => {
      if (disposed || AppState.currentState !== 'active') return;
      const guard = {
        getAuthorization: () => ({
          authenticated: runtime.current.authenticated,
          readOnly: runtime.current.readOnly,
        }),
        isScopeCurrent: () => runtime.current.scopeKey === offlineScopeKey(scope),
      };
      await pilot.sync(scope, guard.getAuthorization(), guard);
      if (!disposed) await schedule();
    };
    void run();
    const unsubscribeFromRequests = subscribeToOfflineSyncRequests(() => { void run(); });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void run();
      else clearRetryTimer();
    });
    return () => {
      disposed = true;
      subscription.remove();
      unsubscribeFromRequests();
      clearRetryTimer();
    };
  }, [allowed, isOnline, isReadOnly, isServerAuthenticated, pilot, scope, status]);

  return null;
}
