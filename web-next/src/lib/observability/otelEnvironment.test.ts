import { describe, expect, it } from "vitest";
import { validateWebOtelEnvironment } from "./otelEnvironment";

describe("web OpenTelemetry environment", () => {
  it("keeps disabled telemetry dependency-free", () => {
    expect(() => validateWebOtelEnvironment({
      NODE_ENV: "production",
      WEB_OTEL_ENABLED: "false",
    })).not.toThrow();
  });

  it("requires an explicit endpoint and sampler for self-hosted production", () => {
    expect(() => validateWebOtelEnvironment({
      NODE_ENV: "production",
      WEB_OTEL_ENABLED: "true",
    })).toThrow(/explicit OTLP endpoint/);

    expect(() => validateWebOtelEnvironment({
      NODE_ENV: "production",
      WEB_OTEL_ENABLED: "true",
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://collector.example.test:4318",
    })).toThrow(/OTEL_TRACES_SAMPLER must be explicit/);
  });

  it("accepts a valid self-hosted production configuration", () => {
    expect(() => validateWebOtelEnvironment({
      NODE_ENV: "production",
      WEB_OTEL_ENABLED: "true",
      OTEL_EXPORTER_OTLP_ENDPOINT: "https://collector.example.test:4318",
      OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
      OTEL_TRACES_SAMPLER: "parentbased_traceidratio",
      OTEL_TRACES_SAMPLER_ARG: "0.1",
    })).not.toThrow();
  });

  it("allows a Vercel-managed exporter while still requiring an explicit sampler", () => {
    expect(() => validateWebOtelEnvironment({
      NODE_ENV: "production",
      VERCEL: "1",
      WEB_OTEL_ENABLED: "true",
      OTEL_TRACES_SAMPLER: "always_on",
    })).not.toThrow();
  });

  it("rejects exporter values that @vercel/otel would silently fall back from", () => {
    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_EXPORTER_OTLP_ENDPOINT: "grpc://collector.example.test:4317",
    })).toThrow(/absolute HTTP\(S\) URL/);

    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_EXPORTER_OTLP_PROTOCOL: "grpc",
    })).toThrow(/http\/protobuf/);

    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_TRACES_SAMPLER: "parentbased_traceidratio",
      OTEL_TRACES_SAMPLER_ARG: "1.5",
    })).toThrow(/0 through 1/);
  });

  it("rejects configuration that silently disables or disconnects tracing", () => {
    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "false",
      NEXT_PUBLIC_WEB_TELEMETRY_ENABLED: "true",
    })).toThrow(/requires WEB_OTEL_ENABLED=true/);

    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_SDK_DISABLED: "true",
    })).toThrow(/must be unset/);

    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_SERVICE_NAME: "unexpected-service",
    })).toThrow(/ErpSystem\.Web/);

    expect(() => validateWebOtelEnvironment({
      WEB_OTEL_ENABLED: "true",
      OTEL_PROPAGATORS: "baggage",
    })).toThrow(/tracecontext/);
  });
});
