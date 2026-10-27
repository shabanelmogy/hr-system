import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiService } from "@/shared/services";
import { errorLogParams, exportErrorLogs, getErrorLogDetail, listErrorLogs, updateErrorLogSettings } from "./errorLogService";

vi.mock("@/shared/services", () => ({ apiService: { get: vi.fn(), put: vi.fn(), getBlobDownload: vi.fn() } }));

const row = {
  id: "00000000-0000-4000-8000-000000000001", occurredOnUtc: "2026-10-17T12:00:00Z",
  source: "api", severity: "error", userName: null, service: "OrdersController",
  action: "GetOrder", statusCode: 500, durationMs: 23, correlationId: "test",
  summary: "HttpServerError", client: "http", browser: null, ipAddress: null,
};

beforeEach(() => vi.clearAllMocks());

describe("Error Log service", () => {
  it("accepts persisted hash-derived .NET GUIDs in list and detail while rejecting malformed IDs", async () => {
    const captured = { ...row, id: "2b92450e-c383-feee-339f-77cae87a7ad6", source: "web" };
    vi.mocked(apiService.get).mockResolvedValueOnce({ items: [captured], totalCount: 1, page: 1, pageSize: 25 });
    expect((await listErrorLogs("system", { page: 1, pageSize: 25 })).items[0].id).toBe(captured.id);
    vi.mocked(apiService.get).mockResolvedValueOnce({ entry: captured, diagnostics: [] });
    expect((await getErrorLogDetail("company", captured.id)).entry.id).toBe(captured.id);
    vi.mocked(apiService.get).mockResolvedValueOnce({ items: [{ ...captured, id: "not-a-guid" }], totalCount: 1, page: 1, pageSize: 25 });
    await expect(listErrorLogs("system", { page: 1, pageSize: 25 })).rejects.toThrow();
  });
  it("serializes only documented criteria and keeps company and system endpoints separate", async () => {
    vi.mocked(apiService.get).mockResolvedValue({ items: [row], totalCount: 1, page: 2, pageSize: 25 });
    const criteria = { source: "api" as const, search: "  test  ", page: 2, pageSize: 25 };
    expect(errorLogParams(criteria).toString()).toContain("page=2&pageSize=25");
    expect((await listErrorLogs("company", criteria)).items).toHaveLength(1);
    expect(apiService.get).toHaveBeenCalledWith("/api/v1/error-logs", { source: "api", search: "  test  ", page: "2", pageSize: "25" });
    await listErrorLogs("system", criteria);
    expect(apiService.get).toHaveBeenLastCalledWith("/api/v1/system-error-logs", expect.any(Object));
  });

  it("rejects a malformed response and preserves detail projection", async () => {
    vi.mocked(apiService.get).mockResolvedValueOnce({ items: [{ ...row, source: "untrusted" }], totalCount: 1, page: 1, pageSize: 25 });
    await expect(listErrorLogs("company", { page: 1, pageSize: 25 })).rejects.toThrow();
    vi.mocked(apiService.get).mockResolvedValueOnce({ entry: row, diagnostics: [] });
    expect((await getErrorLogDetail("company", row.id)).diagnostics).toEqual([]);
  });

  it("exports the filtered scope and writes revision exactly once", async () => {
    vi.mocked(apiService.getBlobDownload).mockResolvedValue({ blob: new Blob(), fileName: "error-logs.xlsx" });
    await exportErrorLogs("system", { statusCode: 500, page: 1, pageSize: 25 });
    expect(apiService.getBlobDownload).toHaveBeenCalledWith("/api/v1/system-error-logs/export?statusCode=500&page=1&pageSize=25");
    vi.mocked(apiService.put).mockResolvedValue({ retentionDays: 30, revision: 5, queueDepth: 0, droppedCount: 0, failedWrites: 0 });
    expect((await updateErrorLogSettings(30, 4)).revision).toBe(5);
    expect(apiService.put).toHaveBeenCalledWith("/api/v1/system-error-logs/settings", { retentionDays: 30, expectedRevision: 4 });
  });
});
