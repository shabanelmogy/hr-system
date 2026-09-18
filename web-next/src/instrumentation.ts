import type { Instrumentation } from "next";
import { registerOTel } from "@vercel/otel";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import { validateWebOtelEnvironment } from "@/lib/observability/otelEnvironment";

export function register() {
  validateWebOtelEnvironment(process.env);
  if (process.env.WEB_OTEL_ENABLED !== "true") return;

  const backendOrigins = getConfiguredBackendOrigins();

  registerOTel({
    serviceName: "ErpSystem.Web",
    attributes: {
      "service.namespace": "ErpSystem",
    },
    instrumentationConfig: backendOrigins.length > 0
      ? {
          fetch: {
            // Only propagate W3C trace context to explicitly configured ERP
            // backend origins. Do not leak distributed tracing headers to
            // arbitrary third-party fetch destinations.
            propagateContextUrls: backendOrigins,
          },
        }
      : undefined,
  });
}

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;
  const errorName = error instanceof Error ? error.name : typeof error;
  const requestPath = request.path.split("?", 1)[0];

  const activeSpan = trace.getActiveSpan();
  activeSpan?.setAttributes({
    "erp.error.source": "next.request",
    "erp.error.name": errorName,
    "erp.request.path": requestPath,
    "erp.request.route": context.routePath,
  });
  activeSpan?.setStatus({ code: SpanStatusCode.ERROR });
  activeSpan?.addEvent("next.request.error", {
    ...(digest ? { "error.digest": digest } : {}),
    "error.type": errorName,
  });

  console.error("[next.request.error]", {
    digest,
    errorName,
    method: request.method,
    path: requestPath,
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
    renderSource: context.renderSource,
  });
};

function getConfiguredBackendOrigins(): string[] {
  const values = [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
    process.env.NEXT_PUBLIC_API_URL,
    ...splitConfiguredOrigins(process.env.BACKEND_ALLOWED_ORIGINS),
  ];

  const origins = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        !url.username &&
        !url.password
      ) {
        origins.add(url.origin);
      }
    } catch {
      // Backend URL validation remains owned by the server environment helpers.
      // Invalid backend origins are simply excluded from trace propagation here.
    }
  }
  return [...origins];
}

function splitConfiguredOrigins(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value.split(/[;,]/).map((origin) => origin.trim()).filter(Boolean);
}
