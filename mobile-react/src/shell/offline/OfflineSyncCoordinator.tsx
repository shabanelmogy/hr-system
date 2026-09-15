import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useConnectivity } from '@/src/core/offline';
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

  useEffect(() => {
    if (!pilot || !scope || !isOnline || !allowed || !isServerAuthenticated
      || status !== 'authenticated' || isReadOnly) return undefined;
    const run = () => {
      if (AppState.currentState === 'active') {
        void pilot.sync(scope, { authenticated: true, readOnly: false });
      }
    };
    run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => subscription.remove();
  }, [allowed, isOnline, isReadOnly, isServerAuthenticated, pilot, scope, status]);

  return null;
}
