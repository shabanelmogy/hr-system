import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crystalReportService } from "./services";

const { get, post, put, del, getBlob, postBlob } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn(), getBlob: vi.fn(), postBlob: vi.fn() }));
vi.mock("@/shared/services/apiService", () => ({ default: { get, post, put, delete: del, getBlob, postBlob } }));

describe("crystalReportService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the management endpoint with server criteria and no tenant identifier", async () => {
    get.mockResolvedValue({ items: [], metaData: { totalCount: 0 } });
    await crystalReportService.listForManagement({ entityKey: "countries", search: "summary", status: "draft", page: 1, pageSize: 10 });
    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.manage, { entityKey: "countries", search: "summary", status: "draft", page: 1, pageSize: 10 });
  });

  it("lists runnable published reports and renders by managed report id", async () => {
    get.mockResolvedValue([{ id: "report", entityKey: "countries", reportKey: "countries", displayName: "بيانات الدول", summaryTitle: "بيانات الدول", summarySubject: "Countries data", isPublished: true, isArchived: false }]);
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    postBlob.mockResolvedValue(pdf);

    const reports = await crystalReportService.listPublished("countries");
    const rendered = await crystalReportService.render(reports[0].id, {
      language: "en",
      filters: { NameEn: "Egypt" },
    });

    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.list, { entityKey: "countries" });
    expect(reports[0]).toMatchObject({
      summaryTitle: "بيانات الدول",
      summarySubject: "Countries data",
    });
    expect(postBlob).toHaveBeenCalledWith(
      apiRoutes.crystalReports.render("report"),
      { language: "en", filters: { NameEn: "Egypt" } },
      "application/pdf",
      120_000,
    );
    expect(rendered).toBe(pdf);
  });

  it("sends row versions for publish, access, and archive lifecycle requests", async () => {
    post.mockResolvedValue(undefined); put.mockResolvedValue(undefined); del.mockResolvedValue(undefined);
    await crystalReportService.publishVersion("report", "version", "AQID");
    await crystalReportService.saveAccess("report", [{ roleId: "role", rights: ["Run"] }], "AQID");
    await crystalReportService.archive("report", "AQID");
    expect(post).toHaveBeenCalledWith(apiRoutes.crystalReports.publishVersion("report", "version"), { rowVersion: "AQID" });
    expect(put).toHaveBeenCalledWith(apiRoutes.crystalReports.access("report"), { grants: [{ roleId: "role", rights: ["Run"] }], rowVersion: "AQID" });
    expect(del).toHaveBeenCalledWith(apiRoutes.crystalReports.archive("report"), { rowVersion: "AQID" });
  });

  it("lists and imports legacy reports without sending a file path", async () => {
    get.mockResolvedValue([{ sourceId: "a".repeat(64), entityKey: "countries", reportKey: "countries", fileName: "Countries.rpt", displayName: "Countries", size: 8704, sha256: "b".repeat(64), lastModifiedUtc: "2026-08-23T00:00:00Z", isImportable: true, isImported: false }]);
    post.mockResolvedValue({ id: "report", entityKey: "countries", reportKey: "countries", displayName: "Countries", isPublished: false, isArchived: false });

    const items = await crystalReportService.listLegacyCandidates();
    await crystalReportService.importLegacy({ sourceId: items[0].sourceId, expectedSha256: items[0].sha256 });

    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.legacyCandidates, {});
    expect(post).toHaveBeenCalledWith(apiRoutes.crystalReports.importLegacy, {
      sourceId: "a".repeat(64),
      expectedSha256: "b".repeat(64),
    });
  });
});
