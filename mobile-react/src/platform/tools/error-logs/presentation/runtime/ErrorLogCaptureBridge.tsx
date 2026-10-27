import { useEffect } from 'react';
import { useAuth } from '@/src/platform/auth';
import { startClientErrorLogCapture } from '../../composition/client-error-log-capture';

export function ErrorLogCaptureBridge() {
  const { session, isServerAuthenticated, isSwitchingCompany } = useAuth();
  const enabled = Boolean(isServerAuthenticated && !isSwitchingCompany && session?.userId &&
    (session.roles.includes('super_admin') || (session.tenantId && session.companyId)));
  useEffect(() => {
    if (!enabled) return;
    return startClientErrorLogCapture();
  }, [enabled, session?.userId, session?.tenantId, session?.companyId]);
  return null;
}
