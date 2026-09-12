import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("API work context isolation", () => {
  let client: typeof import("./client").apiClient;
  let transport: AxiosInstance;

  beforeEach(async () => {
    vi.resetModules();
    transport = axios.create();
    vi.spyOn(axios, "create").mockReturnValue(transport);
    client = (await import("./client")).apiClient;
  });
  afterEach(() => vi.restoreAllMocks());

  it("rejects old-screen writes during a transition without replaying them", async () => {
    const adapter = vi.fn(async (config) => ({ data: "new", status: 200, statusText: "OK", headers: {}, config }));
    transport.defaults.adapter = adapter;
    client.beginContextTransition();
    await expect(client.post("/api/entity", { name: "old company draft" })).rejects.toMatchObject({ code: "ERR_CANCELED" });
    client.endContextTransition();
    expect(adapter).not.toHaveBeenCalled();
    await expect(client.get("/api/entity")).resolves.toBe("new");
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it("keeps the transition gate closed until every nested owner releases it", async () => {
    const adapter = vi.fn(async (config) => ({ data: "new", status: 200, statusText: "OK", headers: {}, config }));
    transport.defaults.adapter = adapter;

    client.beginContextTransition();
    client.beginContextTransition();
    await expect(client.get("/api/entity")).rejects.toMatchObject({ code: "ERR_CANCELED" });

    client.endContextTransition();
    await expect(client.get("/api/entity")).rejects.toMatchObject({ code: "ERR_CANCELED" });
    expect(adapter).not.toHaveBeenCalled();

    client.endContextTransition();
    await expect(client.get("/api/entity")).resolves.toBe("new");
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it("rejects a late previous-company response even when transport ignores abort", async () => {
    let finish!: (response: AxiosResponse) => void;
    let sent!: () => void;
    const started = new Promise<void>((resolve) => { sent = resolve; });
    transport.defaults.adapter = (config) => {
      sent();
      return new Promise<AxiosResponse>((resolve) => { finish = (response) => resolve({ ...response, config }); });
    };
    const pending = client.get("/api/entity");
    const rejected = expect(pending).rejects.toMatchObject({ code: "ERR_CANCELED" });
    await started;
    client.rotateRequestContext();
    finish({ data: "old company data", status: 200, statusText: "OK", headers: {} } as AxiosResponse);
    await rejected;
  });
});
