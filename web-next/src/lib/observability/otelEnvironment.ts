const supportedOtlpProtocols = new Set([
  "http/json",
  "http/protobuf",
]);

const supportedTraceSamplers = new Set([
  "always_off",
  "always_on",
  "parentbased_always_off",
  "parentbased_always_on",
  "parentbased_traceidratio",
  "traceidratio",
]);

const ratioTraceSamplers = new Set([
  "parentbased_traceidratio",
  "traceidratio",
]);

type Environment = Readonly<Record<string, string | undefined>>;

/**
 * Validates the OpenTelemetry settings that @vercel/otel consumes at runtime.
 *
 * The package intentionally has permissive fallbacks (including localhost:4318
 * and 100% sampling). Production should fail before serving traffic when an
 * explicitly enabled exporter would otherwise fall back to those defaults.
 */
export function validateWebOtelEnvironment(environment: Environment): void {
  const enabled = readOptional(environment.WEB_OTEL_ENABLED);
  if (enabled !== undefined && enabled !== "true" && enabled !== "false") {
    throw configurationError("WEB_OTEL_ENABLED must be 'true' or 'false'");
  }

  const clientTelemetryEnabled = readOptional(
    environment.NEXT_PUBLIC_WEB_TELEMETRY_ENABLED,
  );
  if (
    clientTelemetryEnabled !== undefined &&
    clientTelemetryEnabled !== "true" &&
    clientTelemetryEnabled !== "false"
  ) {
    throw configurationError(
      "NEXT_PUBLIC_WEB_TELEMETRY_ENABLED must be 'true' or 'false'",
    );
  }
  if (clientTelemetryEnabled === "true" && enabled !== "true") {
    throw configurationError(
      "NEXT_PUBLIC_WEB_TELEMETRY_ENABLED=true requires WEB_OTEL_ENABLED=true",
    );
  }

  if (enabled !== "true") return;

  // @vercel/otel 2.1.3 treats any non-empty OTEL_SDK_DISABLED value as disabled.
  // Keep one application-owned switch so production cannot silently register no
  // provider while WEB_OTEL_ENABLED says telemetry is active.
  if (readOptional(environment.OTEL_SDK_DISABLED) !== undefined) {
    throw configurationError(
      "OTEL_SDK_DISABLED must be unset while WEB_OTEL_ENABLED=true",
    );
  }

  const serviceName = readOptional(environment.OTEL_SERVICE_NAME);
  if (serviceName !== undefined && serviceName !== "ErpSystem.Web") {
    throw configurationError(
      "OTEL_SERVICE_NAME must be 'ErpSystem.Web' when explicitly configured",
    );
  }

  validatePropagators(environment.OTEL_PROPAGATORS);

  validateEndpoint(
    "OTEL_EXPORTER_OTLP_TRACES_ENDPOINT",
    environment.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  );
  validateEndpoint(
    "OTEL_EXPORTER_OTLP_ENDPOINT",
    environment.OTEL_EXPORTER_OTLP_ENDPOINT,
  );

  validateProtocol(
    "OTEL_EXPORTER_OTLP_TRACES_PROTOCOL",
    environment.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL,
  );
  validateProtocol(
    "OTEL_EXPORTER_OTLP_PROTOCOL",
    environment.OTEL_EXPORTER_OTLP_PROTOCOL,
  );

  const sampler = readOptional(environment.OTEL_TRACES_SAMPLER);
  if (sampler !== undefined && !supportedTraceSamplers.has(sampler)) {
    throw configurationError("OTEL_TRACES_SAMPLER is not supported by the installed @vercel/otel runtime");
  }

  if (sampler && ratioTraceSamplers.has(sampler)) {
    const rawRatio = readOptional(environment.OTEL_TRACES_SAMPLER_ARG);
    const ratio = rawRatio === undefined ? Number.NaN : Number(rawRatio);
    if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
      throw configurationError("OTEL_TRACES_SAMPLER_ARG must be a number from 0 through 1 for ratio sampling");
    }
  }

  if (environment.NODE_ENV !== "production") return;

  const hasManagedVercelExporter =
    environment.VERCEL === "1" ||
    readOptional(environment.VERCEL_OTEL_ENDPOINTS) !== undefined;
  const hasExplicitOtlpEndpoint =
    readOptional(environment.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) !== undefined ||
    readOptional(environment.OTEL_EXPORTER_OTLP_ENDPOINT) !== undefined;

  if (!hasManagedVercelExporter && !hasExplicitOtlpEndpoint) {
    throw configurationError(
      "WEB_OTEL_ENABLED=true requires an explicit OTLP endpoint in self-hosted production",
    );
  }

  if (sampler === undefined) {
    throw configurationError(
      "OTEL_TRACES_SAMPLER must be explicit when OpenTelemetry is enabled in production",
    );
  }
}

function validateEndpoint(name: string, rawValue: string | undefined): void {
  const value = readOptional(rawValue);
  if (value === undefined) return;

  try {
    const url = new URL(value);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      throw new Error("invalid endpoint");
    }
  } catch {
    throw configurationError(
      `${name} must be an absolute HTTP(S) URL without credentials, query, or fragment`,
    );
  }
}

function validateProtocol(name: string, rawValue: string | undefined): void {
  const value = readOptional(rawValue);
  if (value === undefined) return;
  if (!supportedOtlpProtocols.has(value)) {
    throw configurationError(
      `${name} must be 'http/protobuf' or 'http/json' for the installed @vercel/otel runtime`,
    );
  }
}

function validatePropagators(rawValue: string | undefined): void {
  const value = readOptional(rawValue);
  if (value === undefined) return;

  const propagators = value.split(",").map((item) => item.trim()).filter(Boolean);
  const supported = new Set(["auto", "baggage", "none", "tracecontext"]);
  if (propagators.length === 0 || propagators.some((item) => !supported.has(item))) {
    throw configurationError(
      "OTEL_PROPAGATORS contains a value unsupported by the installed @vercel/otel runtime",
    );
  }
  if (!propagators.includes("auto") && !propagators.includes("tracecontext")) {
    throw configurationError(
      "OTEL_PROPAGATORS must preserve W3C tracecontext for ERP distributed tracing",
    );
  }
}

function readOptional(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function configurationError(message: string): Error {
  return new Error(`[web observability] ${message}`);
}
