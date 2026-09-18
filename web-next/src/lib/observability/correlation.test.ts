import { describe, expect, it } from "vitest";
import {
  CORRELATION_ID_HEADER,
  applyCorrelationHeader,
  createCorrelationId,
} from "./correlation";

describe("BFF correlation ids", () => {
  it("creates backend-compatible ids", () => {
    const correlationId = createCorrelationId();

    expect(correlationId).toMatch(/^[A-Za-z0-9._-]+$/);
    expect(correlationId.length).toBeLessThanOrEqual(128);
  });

  it("writes the canonical correlation header", () => {
    const headers = new Headers();

    applyCorrelationHeader(headers, "corr-123");

    expect(headers.get(CORRELATION_ID_HEADER)).toBe("corr-123");
  });
});
