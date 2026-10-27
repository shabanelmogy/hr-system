import { configureErrorLogReporter, installErrorLogRuntimeHooks } from '@/src/core/observability/error-log-reporter';
import { sendClientErrorLog } from '../data/remote/client-error-log-remote';

export function startClientErrorLogCapture(): () => void {
  const disposeReporter = configureErrorLogReporter(sendClientErrorLog);
  const disposeHooks = installErrorLogRuntimeHooks();
  return () => { disposeReporter(); disposeHooks(); };
}
