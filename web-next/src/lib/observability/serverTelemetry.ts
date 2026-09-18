import {
  SpanStatusCode,
  trace,
  type Attributes,
} from "@opentelemetry/api";
import type { ClientTelemetryEvent } from "./clientTelemetryContract";

const tracer = trace.getTracer("ErpSystem.Web.Bff");
const clientTelemetryTracer = trace.getTracer("ErpSystem.Web.ClientTelemetry");

export type BffChannel = "api" | "signalr";

type VerifiedSessionScope = {
  tenantId: string;
  companyId: number;
};

type BffRequestContext = {
  channel: BffChannel;
  correlationId: string;
  method: string;
  route: string;
};

export function annotateActiveBffRequest(context: BffRequestContext) {
  trace.getActiveSpan()?.setAttributes(toRequestAttributes(context));
}

/**
 * Adds tenant/company identifiers only after the caller has completed the normal
 * authenticated session verification path. Browser-provided scope headers and
 * unverified token payloads must never call this helper.
 */
export function annotateActiveVerifiedSessionScope(scope: VerifiedSessionScope) {
  const tenantId = scope.tenantId.trim();
  if (!tenantId || !Number.isSafeInteger(scope.companyId) || scope.companyId <= 0) {
    return;
  }

  trace.getActiveSpan()?.setAttributes({
    "erp.tenant.id": tenantId,
    "erp.company.id": scope.companyId,
  });
}

export async function traceBackendCall(
  context: BffRequestContext,
  operation: () => Promise<Response>,
): Promise<Response> {
  return tracer.startActiveSpan(
    `bff.${context.channel}.backend`,
    { attributes: toRequestAttributes(context) },
    async (span) => {
      try {
        const response = await operation();
        span.setAttribute("http.response.status_code", response.status);
        if (response.status >= 400) {
          span.setStatus({ code: SpanStatusCode.ERROR });
        }
        return response;
      } catch (error) {
        span.setAttribute("erp.failure.kind", classifyTransportFailure(error));
        span.setStatus({ code: SpanStatusCode.ERROR });
        throw error;
      } finally {
        span.end();
      }
    },
  );
}

export function recordBffResponse(status: number) {
  const span = trace.getActiveSpan();
  span?.setAttribute("http.response.status_code", status);
  if (status >= 500) span?.setStatus({ code: SpanStatusCode.ERROR });
}

export function recordClientTelemetryEvent(event: ClientTelemetryEvent): void {
  const span = clientTelemetryTracer.startSpan(`client.${event.kind}`, {
    attributes: toClientTelemetryAttributes(event),
  });

  if (event.kind === "error" || event.kind === "session" || event.kind === "signalr") {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }

  span.end();
}

function toRequestAttributes(context: BffRequestContext): Attributes {
  return {
    "erp.bff.channel": context.channel,
    "erp.correlation_id": context.correlationId,
    "http.request.method": context.method,
    "erp.bff.route": context.route,
  };
}

export function classifyTransportFailure(error: unknown): string {
  if (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  ) {
    return "timeout";
  }

  if (error instanceof TypeError) return "network";
  return "unknown";
}

function toClientTelemetryAttributes(event: ClientTelemetryEvent): Attributes {
  switch (event.kind) {
    case "error":
      return {
        "erp.client.event": event.kind,
        "erp.client.error.source": event.source,
        "error.type": event.errorType,
        ...(event.digest ? { "error.digest": event.digest } : {}),
      };
    case "web-vital":
      return {
        "erp.client.event": event.kind,
        "erp.web_vital.name": event.name,
        "erp.web_vital.value": event.value,
        "erp.web_vital.delta": event.delta,
        "erp.web_vital.rating": event.rating,
        "erp.web_vital.navigation_type": event.navigationType,
      };
    case "navigation":
      return {
        "erp.client.event": event.kind,
        "erp.navigation.type": event.navigationType,
        "erp.navigation.duration_ms": event.durationMs,
      };
    case "session":
      return {
        "erp.client.event": event.kind,
        "erp.session.failure_kind": event.failureKind,
      };
    case "signalr":
      return {
        "erp.client.event": event.kind,
        "erp.signalr.phase": event.phase,
        "erp.signalr.failure_kind": event.failureKind,
        ...(event.suppressedCount !== undefined
          ? { "erp.signalr.suppressed_count": event.suppressedCount }
          : {}),
      };
  }
}
