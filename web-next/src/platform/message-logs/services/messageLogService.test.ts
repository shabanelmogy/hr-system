import { beforeEach, describe, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({ get: vi.fn(), getBlobDownload: vi.fn() }));
vi.mock("@/shared/services", () => ({ apiService: api }));
import { exportMessageLogs, getMessageLog, listMessageLogs, messageLogParams } from "./messageLogService";
import { emptyMessageLogFilters, messageLogCriteria, messageStatusColor } from "../utils/messageLogPresentation";

describe("message history transport", () => {
  beforeEach(() => vi.clearAllMocks());
  it("maps criteria and export to the same bounded server scope without client authority", async () => {
    const criteria = messageLogCriteria({ ...emptyMessageLogFilters, from: "2026-10-21", to: "2026-10-22", status: "accepted", recipient: " recipient " }, " subject ", 1, 25);
    expect(criteria).toEqual({ fromUtc: "2026-10-21T00:00:00.000Z", toUtc: "2026-10-22T23:59:59.999Z", status: "accepted", recipient: "recipient", search: "subject", page: 2, pageSize: 25 });
    const params = messageLogParams({ ...criteria, tenantId: "untrusted" } as typeof criteria);
    expect(params.has("tenantId")).toBe(false);
    api.get.mockResolvedValue({ items: [], totalCount: 0, page: 2, pageSize: 25 });
    await listMessageLogs(criteria); await exportMessageLogs(criteria);
    expect(api.get.mock.calls[0][0]).toMatch(/message-logs$/); expect(api.getBlobDownload.mock.calls[0][0]).toContain(params.toString());
  });
  it("rejects unknown delivery claims and malformed details", async () => {
    api.get.mockResolvedValue({ items: "malformed" }); await expect(listMessageLogs({ page: 1, pageSize: 25 })).rejects.toThrow();
    api.get.mockResolvedValue({ entry: { status: "delivered" }, snapshotHtml: "" }); await expect(getMessageLog("id")).rejects.toThrow();
    expect(messageStatusColor("uncertain")).toBe("warning"); expect(messageStatusColor("accepted")).toBe("success");
  });
});
