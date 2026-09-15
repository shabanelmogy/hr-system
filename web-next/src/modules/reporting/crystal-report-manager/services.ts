import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  CreateCrystalReportRequest,
  CrystalReportAccessGrant,
  CrystalReportDetail,
  CrystalReportListItem,
  CrystalReportPage,
  CrystalReportRight,
  CrystalReportRoleOption,
  CrystalReportStatus,
  CrystalReportVersion,
  DiscoveredCrystalReport,
  ImportDiscoveredCrystalReportRequest,
  RenderCrystalReportRequest,
} from "./types";

type UnknownRecord = Record<string, unknown>;
const RIGHTS: readonly CrystalReportRight[] = ["Run", "Download", "Upload", "Publish"];

function requireRecord(value: unknown, label: string): UnknownRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label} response: expected an object.`);
  }
  return value as UnknownRecord;
}

function requireArray<T>(value: unknown, label: string, parser: (item: unknown) => T): T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${label} response: expected an array.`);
  }
  return value.map(parser);
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`Invalid ${label}: expected a string.`);
  return value;
}

function nullableString(value: unknown, label: string): string | null {
  if (value === null) return null;
  return requireString(value, label);
}

function requireBoolean(value: unknown, label: string): boolean {
  if (typeof value !== "boolean") throw new Error(`Invalid ${label}: expected a boolean.`);
  return value;
}

function requireInteger(value: unknown, label: string, minimum = 0): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < minimum) {
    throw new Error(`Invalid ${label}: expected an integer >= ${minimum}.`);
  }
  return value;
}

function nullablePositiveInteger(value: unknown, label: string): number | null {
  if (value === null) return null;
  return requireInteger(value, label, 1);
}

function parseRight(value: unknown): CrystalReportRight {
  if (typeof value !== "string" || !RIGHTS.includes(value as CrystalReportRight)) {
    throw new Error("Invalid crystalReportGrant.rights response.");
  }
  return value as CrystalReportRight;
}

function parseListItem(value: unknown): CrystalReportListItem {
  const source = requireRecord(value, "crystal report list item");
  return {
    id: requireString(source.id, "crystalReport.id"),
    entityKey: requireString(source.entityKey, "crystalReport.entityKey"),
    reportKey: requireString(source.reportKey, "crystalReport.reportKey"),
    displayName: requireString(source.displayName, "crystalReport.displayName"),
    summaryTitle: nullableString(source.summaryTitle, "crystalReport.summaryTitle"),
    summarySubject: nullableString(source.summarySubject, "crystalReport.summarySubject"),
    description: nullableString(source.description, "crystalReport.description"),
    currentVersionNumber: nullablePositiveInteger(source.currentVersionNumber, "crystalReport.currentVersionNumber"),
    isPublished: requireBoolean(source.isPublished, "crystalReport.isPublished"),
    isArchived: requireBoolean(source.isArchived, "crystalReport.isArchived"),
    rowVersion: requireString(source.rowVersion, "crystalReport.rowVersion"),
    updatedOn: nullableString(source.updatedOn, "crystalReport.updatedOn"),
  };
}

function parseVersion(value: unknown): CrystalReportVersion {
  const source = requireRecord(value, "crystal report version");
  const validationStatus = requireString(source.validationStatus, "crystalReportVersion.validationStatus");
  if (validationStatus !== "Valid" && validationStatus !== "Invalid") {
    throw new Error("Invalid crystalReportVersion.validationStatus response.");
  }
  return {
    id: requireString(source.id, "crystalReportVersion.id"),
    versionNumber: requireInteger(source.versionNumber, "crystalReportVersion.versionNumber", 1),
    originalFileName: requireString(source.originalFileName, "crystalReportVersion.originalFileName"),
    size: requireInteger(source.size, "crystalReportVersion.size"),
    sha256: requireString(source.sha256, "crystalReportVersion.sha256"),
    summaryTitle: nullableString(source.summaryTitle, "crystalReportVersion.summaryTitle"),
    summarySubject: nullableString(source.summarySubject, "crystalReportVersion.summarySubject"),
    validationStatus,
    validationReason: nullableString(source.validationReason, "crystalReportVersion.validationReason"),
    isPublished: requireBoolean(source.isPublished, "crystalReportVersion.isPublished"),
    createdOn: requireString(source.createdOn, "crystalReportVersion.createdOn"),
  };
}

function parseGrant(value: unknown): CrystalReportAccessGrant {
  const source = requireRecord(value, "crystal report grant");
  return {
    roleId: requireString(source.roleId, "crystalReportGrant.roleId"),
    roleName: requireString(source.roleName, "crystalReportGrant.roleName"),
    rights: requireArray(source.rights, "crystal report grant rights", parseRight),
  };
}

function parseDetail(value: unknown): CrystalReportDetail {
  const source = requireRecord(value, "crystal report detail");
  return {
    id: requireString(source.id, "crystalReportDetail.id"),
    entityKey: requireString(source.entityKey, "crystalReportDetail.entityKey"),
    reportKey: requireString(source.reportKey, "crystalReportDetail.reportKey"),
    displayName: requireString(source.displayName, "crystalReportDetail.displayName"),
    description: nullableString(source.description, "crystalReportDetail.description"),
    currentVersionNumber: nullablePositiveInteger(source.currentVersionNumber, "crystalReportDetail.currentVersionNumber"),
    isPublished: requireBoolean(source.isPublished, "crystalReportDetail.isPublished"),
    isArchived: requireBoolean(source.isArchived, "crystalReportDetail.isArchived"),
    rowVersion: requireString(source.rowVersion, "crystalReportDetail.rowVersion"),
    createdOn: requireString(source.createdOn, "crystalReportDetail.createdOn"),
    updatedOn: nullableString(source.updatedOn, "crystalReportDetail.updatedOn"),
    versions: requireArray(source.versions, "crystal report versions", parseVersion),
    access: requireArray(source.access, "crystal report access", parseGrant),
  };
}

function parsePage(value: unknown): CrystalReportPage {
  const source = requireRecord(value, "crystal report page");
  return {
    items: requireArray(source.items, "crystal report page items", parseListItem),
    totalCount: requireInteger(source.totalCount, "crystalReportPage.totalCount"),
  };
}

function parseDiscovered(value: unknown): DiscoveredCrystalReport {
  const source = requireRecord(value, "discovered crystal report");
  return {
    sourceId: requireString(source.sourceId, "discoveredCrystalReport.sourceId"),
    entityKey: requireString(source.entityKey, "discoveredCrystalReport.entityKey"),
    reportKey: requireString(source.reportKey, "discoveredCrystalReport.reportKey"),
    fileName: requireString(source.fileName, "discoveredCrystalReport.fileName"),
    displayName: requireString(source.displayName, "discoveredCrystalReport.displayName"),
    subject: nullableString(source.subject, "discoveredCrystalReport.subject"),
    size: requireInteger(source.size, "discoveredCrystalReport.size"),
    sha256: requireString(source.sha256, "discoveredCrystalReport.sha256"),
    lastModifiedUtc: requireString(source.lastModifiedUtc, "discoveredCrystalReport.lastModifiedUtc"),
    isImportable: requireBoolean(source.isImportable, "discoveredCrystalReport.isImportable"),
    validationReason: nullableString(source.validationReason, "discoveredCrystalReport.validationReason"),
    isImported: requireBoolean(source.isImported, "discoveredCrystalReport.isImported"),
  };
}

function parseRoleOption(value: unknown): CrystalReportRoleOption {
  const source = requireRecord(value, "crystal report role option");
  return {
    id: requireString(source.id, "crystalReportRoleOption.id"),
    name: requireString(source.name, "crystalReportRoleOption.name"),
  };
}

function toFormData(request: CreateCrystalReportRequest): FormData {
  const body = new FormData();
  body.append("entityKey", request.entityKey);
  if (request.description) body.append("description", request.description);
  body.append("file", request.file);
  return body;
}

export const crystalReportService = {
  async listPublished(entityKey?: string, search?: string): Promise<CrystalReportListItem[]> {
    const response = await apiService.get<unknown>(apiRoutes.crystalReports.list, {
      ...(entityKey ? { entityKey } : {}),
      ...(search ? { search } : {}),
    });
    return requireArray(response, "published crystal reports", parseListItem);
  },

  render: (id: string, request: RenderCrystalReportRequest) =>
    apiService.postBlob(apiRoutes.crystalReports.render(id), request, "application/pdf", 120_000),

  async listGrantRoleOptions(): Promise<CrystalReportRoleOption[]> {
    return requireArray(
      await apiService.get<unknown>(apiRoutes.crystalReports.grantRoleOptions),
      "crystal report role options",
      parseRoleOption,
    );
  },

  async listForManagement(query: {
    entityKey?: string;
    search?: string;
    status?: CrystalReportStatus;
    page?: number;
    pageSize?: number;
  }): Promise<CrystalReportPage> {
    return parsePage(await apiService.get<unknown>(apiRoutes.crystalReports.manage, query));
  },

  async get(id: string): Promise<CrystalReportDetail> {
    return parseDetail(await apiService.get<unknown>(apiRoutes.crystalReports.getForManagement(id)));
  },

  async create(request: CreateCrystalReportRequest): Promise<CrystalReportDetail> {
    return parseDetail(await apiService.post<unknown>(apiRoutes.crystalReports.create, toFormData(request)));
  },

  async listDeploymentCandidates(entityKey?: string): Promise<DiscoveredCrystalReport[]> {
    return requireArray(
      await apiService.get<unknown>(
        apiRoutes.crystalReports.deploymentCandidates,
        entityKey ? { entityKey } : {},
      ),
      "discovered crystal reports",
      parseDiscovered,
    );
  },

  async importDeployment(request: ImportDiscoveredCrystalReportRequest): Promise<CrystalReportDetail> {
    return parseDetail(await apiService.post<unknown>(apiRoutes.crystalReports.importDeployment, request));
  },

  async uploadVersion(id: string, file: File): Promise<CrystalReportVersion> {
    const body = new FormData();
    body.append("file", file);
    return parseVersion(await apiService.post<unknown>(apiRoutes.crystalReports.versions(id), body));
  },

  async publishVersion(id: string, versionId: string, rowVersion: string): Promise<CrystalReportDetail> {
    return parseDetail(await apiService.post<unknown>(
      apiRoutes.crystalReports.publishVersion(id, versionId),
      { rowVersion },
    ));
  },

  async saveAccess(
    id: string,
    grants: CrystalReportAccessGrant[],
    rowVersion: string,
  ): Promise<CrystalReportAccessGrant[]> {
    const response = await apiService.put<unknown>(apiRoutes.crystalReports.access(id), {
      grants: grants.map(({ roleId, rights }) => ({ roleId, rights })),
      rowVersion,
    });
    return requireArray(response, "crystal report access", parseGrant);
  },

  archive: (id: string, rowVersion: string) =>
    apiService.delete<void>(apiRoutes.crystalReports.archive(id), { rowVersion }),

  async download(id: string): Promise<{ blob: Blob; fileName: string }> {
    const result = await apiService.getBlobDownload(apiRoutes.crystalReports.download(id));
    if (!result.fileName) throw new Error("Invalid crystal report download response: missing filename.");
    return { blob: result.blob, fileName: result.fileName };
  },

  async downloadVersion(id: string, versionId: string): Promise<{ blob: Blob; fileName: string }> {
    const result = await apiService.getBlobDownload(apiRoutes.crystalReports.downloadVersion(id, versionId));
    if (!result.fileName) throw new Error("Invalid crystal report version download response: missing filename.");
    return { blob: result.blob, fileName: result.fileName };
  },
};
