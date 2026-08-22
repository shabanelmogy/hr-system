import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env/server", () => ({
  getBackendUrl: () => "https://api.example.test",
}));

import { GET, POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API BFF transport", () => {
  it("streams range responses and preserves media headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("video bytes", {
      status: 206,
      headers: {
        "accept-ranges": "bytes",
        "content-range": "bytes 0-10/100",
        "content-type": "video/mp4",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://app.example.test/api/v1/Files/Stream/file-id", {
        headers: { range: "bytes=0-10" },
      }),
      parameters("v1", "Files", "Stream", "file-id"),
    );

    expect(response.status).toBe(206);
    expect(response.headers.get("accept-ranges")).toBe("bytes");
    expect(response.headers.get("content-range")).toBe("bytes 0-10/100");
    expect(response.headers.get("content-type")).toBe("video/mp4");
    expect(await response.text()).toBe("video bytes");

    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(new Headers(init.headers).get("range")).toBe("bytes=0-10");
  });

  it("forwards multipart uploads as streams instead of ArrayBuffers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json(["file-id"]));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new NextRequest("https://app.example.test/api/v1/Files/UploadMany", {
        method: "POST",
        headers: { "content-type": "multipart/form-data; boundary=test" },
        body: "multipart payload",
      }),
      parameters("v1", "Files", "UploadMany"),
    );

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [URL, RequestInit & { duplex?: string }];
    expect(init.body).toBeInstanceOf(ReadableStream);
    expect(init.duplex).toBe("half");
  });
});

function parameters(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}
