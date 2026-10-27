import { afterEach, describe, expect, it, vi } from "vitest";
import { configureErrorLogReporter, reportErrorLog } from "./errorLogReporter";

describe("authenticated error log reporter", () => {
  let dispose: (() => void) | undefined;
  afterEach(() => { dispose?.(); vi.restoreAllMocks(); });

  it("emits enum/GUID metadata only and deduplicates the same failure across boundaries", () => {
    const send = vi.fn().mockResolvedValue(undefined);
    dispose = configureErrorLogReporter(send);
    const failure = new TypeError("password=private; url=/customer/private");
    reportErrorLog("runtime", failure); reportErrorLog("boundary", failure);
    expect(send).toHaveBeenCalledTimes(1);
    const report = send.mock.calls[0][0];
    expect(report).toEqual({ source: "web", kind: "runtime", errorType: "TypeError", eventId: expect.any(String) });
    expect(Object.keys(report).sort()).toEqual(["errorType", "eventId", "kind", "source"]);
    expect(JSON.stringify(report)).not.toContain("private");
  });

  it("does not repeat server failures and reports connection failures independently", () => {
    const send = vi.fn().mockResolvedValue(undefined); dispose = configureErrorLogReporter(send);
    reportErrorLog("rejection", Object.assign(new Error("private"), { status: 500 }));
    reportErrorLog("rejection", { status: 403, detail: "private" });
    reportErrorLog("rejection", Object.assign(new Error("network wrapper"), { name: "ApiClientError", status: 0 }));
    expect(send).not.toHaveBeenCalled();
    reportErrorLog("network", new Error("private transport"));
    expect(send.mock.calls[0][0].errorType).toBe("NetworkError");
  });

  it("bounds submissions and resets identity dedup when the authenticated context changes", () => {
    const first = vi.fn().mockResolvedValue(undefined); dispose = configureErrorLogReporter(first);
    const same = new Error("private"); reportErrorLog("runtime", same);
    for (let i = 0; i < 30; i++) reportErrorLog("runtime", new Error("private"));
    expect(first).toHaveBeenCalledTimes(20);
    dispose(); reportErrorLog("runtime", new Error("logged out"));
    expect(first).toHaveBeenCalledTimes(20);
    const second = vi.fn().mockResolvedValue(undefined); dispose = configureErrorLogReporter(second);
    reportErrorLog("runtime", same); expect(second).toHaveBeenCalledTimes(1);
  });

  it("never propagates sender errors and old scope disposal cannot remove the newer sender", async () => {
    const old = configureErrorLogReporter(vi.fn().mockRejectedValue(new Error("offline")));
    reportErrorLog("runtime", new Error("first"));
    const next = vi.fn().mockResolvedValue(undefined); dispose = configureErrorLogReporter(next);
    old(); expect(() => reportErrorLog("runtime", new Error("second"))).not.toThrow();
    expect(next).toHaveBeenCalledTimes(1);
    await Promise.resolve();
  });

  it("retains a newer scope registration when both scopes use the same transport function", () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const old = configureErrorLogReporter(send);
    dispose = configureErrorLogReporter(send);
    old(); reportErrorLog("runtime", new Error("safe classification"));
    expect(send).toHaveBeenCalledTimes(1);
  });
});
