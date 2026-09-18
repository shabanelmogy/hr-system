export type CspViolation = {
  directive: string;
  blockedKind: "inline" | "eval" | "blob" | "data" | "same-origin" | "external" | "unknown";
  blockedOrigin?: string;
  disposition: "report" | "enforce" | "unknown";
  statusCode?: number;
};

const DIRECTIVE_PATTERN = /^[a-z][a-z0-9-]{0,63}$/;

export function normalizeCspViolationReports(value: unknown): CspViolation[] {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeReportingApiEntry);
  }

  const record = asRecord(value);
  if (!record) return [];

  const legacyBody = asRecord(record["csp-report"]);
  if (!legacyBody) return [];

  const violation = normalizeViolation({
    directive: legacyBody["effective-directive"] ?? legacyBody["violated-directive"],
    blockedUrl: legacyBody["blocked-uri"],
    documentUrl: legacyBody["document-uri"],
    disposition: legacyBody.disposition,
    statusCode: legacyBody["status-code"],
  });

  return violation ? [violation] : [];
}

function normalizeReportingApiEntry(value: unknown): CspViolation[] {
  const report = asRecord(value);
  if (!report || report.type !== "csp-violation") return [];

  const body = asRecord(report.body);
  if (!body) return [];

  const violation = normalizeViolation({
    directive: body.effectiveDirective,
    blockedUrl: body.blockedURL,
    documentUrl: body.documentURL,
    disposition: body.disposition,
    statusCode: body.statusCode,
  });

  return violation ? [violation] : [];
}

function normalizeViolation(input: {
  directive: unknown;
  blockedUrl: unknown;
  documentUrl: unknown;
  disposition: unknown;
  statusCode: unknown;
}): CspViolation | null {
  const directive = normalizeDirective(input.directive);
  if (!directive) return null;

  const blocked = normalizeBlockedSource(input.blockedUrl, input.documentUrl);
  const statusCode = normalizeStatusCode(input.statusCode);

  return {
    directive,
    blockedKind: blocked.kind,
    ...(blocked.origin ? { blockedOrigin: blocked.origin } : {}),
    disposition: normalizeDisposition(input.disposition),
    ...(statusCode === undefined ? {} : { statusCode }),
  };
}

function normalizeDirective(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return DIRECTIVE_PATTERN.test(normalized) ? normalized : null;
}

function normalizeDisposition(value: unknown): CspViolation["disposition"] {
  return value === "report" || value === "enforce" ? value : "unknown";
}

function normalizeStatusCode(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599
    ? value
    : undefined;
}

function normalizeBlockedSource(
  blockedUrl: unknown,
  documentUrl: unknown,
): { kind: CspViolation["blockedKind"]; origin?: string } {
  if (typeof blockedUrl !== "string" || !blockedUrl.trim()) return { kind: "unknown" };

  const value = blockedUrl.trim().toLowerCase();
  if (value === "inline") return { kind: "inline" };
  if (value.includes("eval")) return { kind: "eval" };
  if (value.startsWith("blob:")) return { kind: "blob" };
  if (value.startsWith("data:")) return { kind: "data" };

  const blockedOrigin = safeOrigin(blockedUrl);
  if (!blockedOrigin) return { kind: "unknown" };

  const documentOrigin = safeOrigin(documentUrl);
  if (documentOrigin && documentOrigin === blockedOrigin) {
    return { kind: "same-origin" };
  }

  return { kind: "external", origin: blockedOrigin };
}

function safeOrigin(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol) || url.username || url.password) {
      return undefined;
    }
    return url.origin.slice(0, 200);
  } catch {
    return undefined;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
