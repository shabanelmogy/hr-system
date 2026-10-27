export type ErrorLogReportKind = "runtime" | "network" | "boundary" | "rejection";
export type ErrorLogReport = {
  source: "web";
  kind: ErrorLogReportKind;
  errorType: "Error" | "TypeError" | "ReferenceError" | "RangeError" | "SyntaxError" | "NetworkError" | "unknown";
  eventId: string;
};

let sender: ((report: ErrorLogReport) => Promise<unknown>) | null = null;
let senderLease: symbol | null = null;
let seen = new WeakSet<object>();
let primitiveSeen = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;

/** The authenticated shell installs a sender for exactly its current session scope. */
export function configureErrorLogReporter(send: (report: ErrorLogReport) => Promise<unknown>): () => void {
  sender = send;
  const lease = Symbol("error-log-scope");
  senderLease = lease;
  seen = new WeakSet(); primitiveSeen = new Map(); windowStart = 0; windowCount = 0;
  return () => { if (senderLease === lease) { sender = null; senderLease = null; } };
}

/** Accepts unknown failures locally, but only emits the four allowlisted metadata fields. */
export function reportErrorLog(kind: ErrorLogReportKind, error: unknown): void {
  try {
    if (!sender || isCapturedServerFailure(error)) return;
    const now = Date.now();
    if (now - windowStart >= 60_000) { windowStart = now; windowCount = 0; }
    if (windowCount >= 20) return;
    const errorType = classify(error, kind);
    if (typeof error === "object" && error !== null) {
      if (seen.has(error)) return;
      seen.add(error);
    } else {
      const key = `${kind}:${errorType}`;
      if (now - (primitiveSeen.get(key) ?? 0) < 5_000) return;
      primitiveSeen.set(key, now);
    }
    if (typeof crypto?.randomUUID !== "function") return;
    windowCount++;
    void sender({ source: "web", kind, errorType, eventId: crypto.randomUUID() }).catch(() => undefined);
  } catch {
    // Reporting must never create another application failure.
  }
}

function isCapturedServerFailure(error: unknown): boolean {
  return typeof error === "object" && error !== null && "status" in error &&
    typeof error.status === "number" && (error.status >= 400 ||
      (error.status === 0 && "name" in error && error.name === "ApiClientError"));
}

function classify(error: unknown, kind: ErrorLogReportKind): ErrorLogReport["errorType"] {
  if (kind === "network") return "NetworkError";
  if (!(error instanceof Error)) return "unknown";
  switch (error.name) {
    case "Error": case "TypeError": case "ReferenceError": case "RangeError": case "SyntaxError": return error.name;
    default: return "unknown";
  }
}
