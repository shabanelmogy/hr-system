import { randomUUID } from 'expo-crypto';

export type ErrorLogReportKind = 'runtime' | 'network' | 'boundary' | 'rejection';
export interface ClientErrorLogReport {
  source: 'mobile';
  kind: ErrorLogReportKind;
  errorType: 'Error' | 'TypeError' | 'ReferenceError' | 'RangeError' | 'SyntaxError' | 'NetworkError' | 'unknown';
  eventId: string;
}

let sender: ((report: ClientErrorLogReport) => Promise<unknown>) | null = null;
let lease: symbol | null = null;
let seen = new WeakSet<object>();
let primitiveSeen = new Map<string, number>();
let windowStart = 0;
let count = 0;

/** Authenticated composition supplies transport; Core remains independent of Platform. */
export function configureErrorLogReporter(send: (report: ClientErrorLogReport) => Promise<unknown>): () => void {
  const registration = Symbol('error-log-scope');
  lease = registration; sender = send;
  seen = new WeakSet(); primitiveSeen = new Map(); windowStart = 0; count = 0;
  return () => { if (lease === registration) { sender = null; lease = null; } };
}

export function reportErrorLog(kind: ErrorLogReportKind, error: unknown): void {
  try {
    if (!sender || isTransportFailure(error)) return;
    const now = Date.now();
    if (now - windowStart >= 60_000) { windowStart = now; count = 0; }
    if (count >= 20) return;
    const errorType = classify(error, kind);
    if (typeof error === 'object' && error !== null) {
      if (seen.has(error)) return;
      seen.add(error);
    } else {
      const key = `${kind}:${errorType}`;
      if (now - (primitiveSeen.get(key) ?? 0) < 5_000) return;
      primitiveSeen.set(key, now);
    }
    count++;
    void sender({ source: 'mobile', kind, errorType, eventId: randomUUID() }).catch(() => undefined);
  } catch {
    // Recording must never change the app's error handling or trigger recursion.
  }
}

function isTransportFailure(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error &&
    typeof error.status === 'number' && (error.status >= 400 ||
      (error.status === 0 && 'name' in error && error.name === 'ApiError'));
}

function classify(error: unknown, kind: ErrorLogReportKind): ClientErrorLogReport['errorType'] {
  if (kind === 'network') return 'NetworkError';
  if (!(error instanceof Error)) return 'unknown';
  switch (error.name) {
    case 'Error': case 'TypeError': case 'ReferenceError': case 'RangeError': case 'SyntaxError': return error.name;
    default: return 'unknown';
  }
}

type NativeErrorHandler = (error: Error, isFatal?: boolean) => void;
interface RuntimeHooks {
  ErrorUtils?: { getGlobalHandler: () => NativeErrorHandler; setGlobalHandler: (handler: NativeErrorHandler) => void };
  addEventListener?: (type: string, callback: (event: unknown) => void) => void;
  removeEventListener?: (type: string, callback: (event: unknown) => void) => void;
}

/** Chain existing native handlers; the runtime retains its normal fatal/development behavior. */
export function installErrorLogRuntimeHooks(): () => void {
  const runtime = globalThis as typeof globalThis & RuntimeHooks;
  const tools = runtime.ErrorUtils;
  const previous = tools?.getGlobalHandler();
  const handler: NativeErrorHandler = (error, fatal) => {
    try { reportErrorLog('runtime', error); }
    finally { previous?.(error, fatal); }
  };
  tools?.setGlobalHandler(handler);
  const onRejection = (event: unknown) => {
    reportErrorLog('rejection', typeof event === 'object' && event !== null && 'reason' in event ? event.reason : undefined);
  };
  runtime.addEventListener?.('unhandledrejection', onRejection);
  return () => {
    if (tools?.getGlobalHandler() === handler && previous) tools.setGlobalHandler(previous);
    runtime.removeEventListener?.('unhandledrejection', onRejection);
  };
}
