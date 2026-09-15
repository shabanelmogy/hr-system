import { apiRoutes } from "@/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crystalReportService } from "./services";

const { get, post, put, del, getBlobDownload, postBlob } = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  getBlobDownload: vi.fn(),
  postBlob: vi.fn(),
}));
vi.mock("@/shared/services/apiService", () => ({
  default: { get, post, put, delete: del, getBlobDownload, postBlob },
}));

const listItem = {
  id: "11111111-1111-1111-1111-111111111111",
  entityKey: "countries",
  reportKey: "countries",
  displayName: "Countries",
  summaryTitle: "Country Summary",
  summarySubject: "Countries data",
  description: null,
  currentVersionNumber: 1,
  isPublished: true,
  isArchived: false,
  rowVersion: "AQID",
  updatedOn: null,
};

const version = {
  id: "22222222-2222-2222-2222-222222222222",
  versionNumber: 1,
  originalFileName: "Countries.rpt",
  size: 8704,
  sha256: "b".repeat(64),
  summaryTitle: "Country Summary",
  summarySubject: "Countries data",
  validationStatus: "Valid",
  validationReason: null,
  isPublished: true,
  createdOn: "2026-09-14T00:00:00Z",
};

const grant = {
  roleId: "role-1",
  roleName: "Admin",
  rights: ["Run"],
};

const detail = {
  id: listItem.id,
  entityKey: listItem.entityKey,
  reportKey: listItem.reportKey,
  displayName: listItem.displayName,
  description: null,
  currentVersionNumber: 1,
  isPublished: true,
  isArchived: false,
  rowVersion: "AQID",
  createdOn: "2026-09-14T00:00:00Z",
  updatedOn: null,
  versions: [version],
  access: [grant],
};

describe("crystalReportService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses the exact management page contract with server criteria", async () => {
    get.mockResolvedValue({ items: [], totalCount: 0 });
    await crystalReportService.listForManagement({
      entityKey: "countries",
      search: "summary",
      status: "draft",
      page: 1,
      pageSize: 10,
    });
    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.manage, {
      entityKey: "countries",
      search: "summary",
      status: "draft",
      page: 1,
      pageSize: 10,
    });
  });

  it("rejects the removed management response envelope", async () => {
    get.mockResolvedValue({ items: [], metaData: { totalCount: 0 } });
    await expect(crystalReportService.listForManagement({ page: 1, pageSize: 10 }))
      .rejects.toThrow("crystalReportPage.totalCount");
  });

  it("lists runnable published reports and renders by managed report id", async () => {
    get.mockResolvedValue([listItem]);
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    postBlob.mockResolvedValue(pdf);

    const reports = await crystalReportService.listPublished("countries");
    const rendered = await crystalReportService.render(reports[0].id, {
      language: "en",
      filters: { NameEn: "Egypt" },
    });

    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.list, { entityKey: "countries" });
    expect(reports[0]).toEqual(listItem);
    expect(postBlob).toHaveBeenCalledWith(
      apiRoutes.crystalReports.render(listItem.id),
      { language: "en", filters: { NameEn: "Egypt" } },
      "application/pdf",
      120_000,
    );
    expect(rendered).toBe(pdf);
  });

  it("uses exact success bodies for publish and access while sending row versions", async () => {
    post.mockResolvedValue(detail);
    put.mockResolvedValue([grant]);
    del.mockResolvedValue(undefined);

    const published = await crystalReportService.publishVersion(listItem.id, version.id, "AQID");
    const access = await crystalReportService.saveAccess(
      listItem.id,
      [{ roleId: grant.roleId, roleName: grant.roleName, rights: ["Run"] }],
      "AQID",
    );
    await crystalReportService.archive(listItem.id, "AQID");

    expect(published).toEqual(detail);
    expect(access).toEqual([grant]);
    expect(post).toHaveBeenCalledWith(
      apiRoutes.crystalReports.publishVersion(listItem.id, version.id),
      { rowVersion: "AQID" },
    );
    expect(put).toHaveBeenCalledWith(apiRoutes.crystalReports.access(listItem.id), {
      grants: [{ roleId: grant.roleId, rights: ["Run"] }],
      rowVersion: "AQID",
    });
    expect(del).toHaveBeenCalledWith(apiRoutes.crystalReports.archive(listItem.id), { rowVersion: "AQID" });
  });

  it("lists canonical grant role options from the Reporting-owned endpoint", async () => {
    get.mockResolvedValue([{ id: "role-1", name: "Admin" }]);
    await expect(crystalReportService.listGrantRoleOptions()).resolves.toEqual([
      { id: "role-1", name: "Admin" },
    ]);
    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.grantRoleOptions);
  });

  it("lists and imports deployment reports using exact current DTOs", async () => {
    get.mockResolvedValue([{
      sourceId: "a".repeat(64),
      entityKey: "countries",
      reportKey: "countries",
      fileName: "Countries.rpt",
      displayName: "Countries",
      subject: null,
      size: 8704,
      sha256: "b".repeat(64),
      lastModifiedUtc: "2026-08-23T00:00:00Z",
      isImportable: true,
      validationReason: null,
      isImported: false,
    }]);
    post.mockResolvedValue(detail);

    const items = await crystalReportService.listDeploymentCandidates();
    const imported = await crystalReportService.importDeployment({
      sourceId: items[0].sourceId,
      expectedSha256: items[0].sha256,
    });

    expect(imported).toEqual(detail);
    expect(get).toHaveBeenCalledWith(apiRoutes.crystalReports.deploymentCandidates, {});
    expect(post).toHaveBeenCalledWith(apiRoutes.crystalReports.importDeployment, {
      sourceId: "a".repeat(64),
      expectedSha256: "b".repeat(64),
    });
  });
});
