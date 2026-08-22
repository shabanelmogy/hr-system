import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { copyBackendResponseHeaders, prepareBackendBody } from "./proxy-transport";

describe("prepareBackendBody", () => {
  it("keeps multipart bodies as non-replayable streams", async () => {
    const request = new Request("https://app.example.test/api/v1/files/uploadMany", {
      method: "POST",
      headers: { "content-type": "multipart/form-data; boundary=test" },
      body: "multipart payload",
    });

    const prepared = await prepareBackendBody(request);

    expect(prepared.streaming).toBe(true);
    expect(prepared.replayable).toBe(false);
    expect(prepared.body).toBe(request.body);
  });

  it("buffers small JSON bodies so an authenticated request can be retried", async () => {
    const request = new Request("https://app.example.test/api/v1/countries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nameEn: "Egypt" }),
    });

    const prepared = await prepareBackendBody(request);

    expect(prepared.streaming).toBe(false);
    expect(prepared.replayable).toBe(true);
    expect(new TextDecoder().decode(prepared.body as ArrayBuffer)).toContain("Egypt");
  });
});

describe("copyBackendResponseHeaders", () => {
  it("preserves range and file metadata without forwarding unrelated headers", () => {
    const source = new Headers({
      "accept-ranges": "bytes",
      "content-range": "bytes 0-99/1000",
      "content-length": "100",
      "content-type": "video/mp4",
      "x-internal-header": "secret",
    });
    const target = new Headers();

    copyBackendResponseHeaders(source, target);

    expect(target.get("accept-ranges")).toBe("bytes");
    expect(target.get("content-range")).toBe("bytes 0-99/1000");
    expect(target.get("content-length")).toBe("100");
    expect(target.get("content-type")).toBe("video/mp4");
    expect(target.has("x-internal-header")).toBe(false);
  });
});
