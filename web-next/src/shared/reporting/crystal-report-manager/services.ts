import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type { CrystalReportAccessGrant, CrystalReportDetail, CrystalReportListItem, CrystalReportPage, CrystalReportRoleOption, CrystalReportStatus, CrystalReportVersion, CreateCrystalReportRequest, DiscoveredCrystalReport, ImportDiscoveredCrystalReportRequest, RenderCrystalReportRequest } from "./types";

const unwrap = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const pick = (value: Record<string, unknown>, camel: string) => value[camel] ?? value[camel[0].toUpperCase() + camel.slice(1)];
const string = (value: unknown) => typeof value === "string" ? value : "";
const bool = (value: unknown) => value === true;
const number = (value: unknown) => typeof value === "number" ? value : null;

function report(value: unknown): CrystalReportListItem {
  const source = unwrap(value);
  return {
    id: string(pick(source, "id")), entityKey: string(pick(source, "entityKey")), reportKey: string(pick(source, "reportKey")),
    displayName: string(pick(source, "displayName")) || string(pick(source, "summaryTitle")) || string(pick(source, "reportKey")),
    summaryTitle: (pick(source, "summaryTitle") as string | null) ?? null,
    summarySubject: (pick(source, "summarySubject") as string | null) ?? null,
    description: (pick(source, "description") as string | null) ?? null,
    currentVersionNumber: number(pick(source, "currentVersionNumber")), isPublished: bool(pick(source, "isPublished")),
    isArchived: bool(pick(source, "isArchived")), rowVersion: string(pick(source, "rowVersion")), updatedOn: string(pick(source, "updatedOn")),
  };
}

function version(value: unknown): CrystalReportVersion {
  const source = unwrap(value);
  const isPublished = bool(pick(source, "isPublished"));
  const validationStatus = string(pick(source, "validationStatus")).toLowerCase();
  return { id: string(pick(source, "id")), versionNumber: number(pick(source, "versionNumber")) ?? 0,
    originalFileName: string(pick(source, "originalFileName")), validationStatus: isPublished ? "published" : validationStatus,
    validationMessage: (pick(source, "validationMessage") as string | null) ?? (pick(source, "validationReason") as string | null) ?? null, summaryTitle: (pick(source, "summaryTitle") as string | null) ?? null, summarySubject: (pick(source, "summarySubject") as string | null) ?? null,
    size: number(pick(source, "size")), createdOn: string(pick(source, "createdOn")), rowVersion: string(pick(source, "rowVersion")) };
}

function list(value: unknown): CrystalReportPage {
  const root = unwrap(value); const source = Array.isArray(value) ? value : (pick(root, "items") ?? pick(root, "data"));
  const items = Array.isArray(source) ? source.map(report) : [];
  const meta = unwrap(pick(root, "metaData") ?? pick(root, "metadata"));
  return { items, totalCount: number(pick(root, "totalCount")) ?? number(pick(meta, "totalCount")) ?? items.length };
}

function discovered(value: unknown): DiscoveredCrystalReport {
  const source = unwrap(value);
  return {
    sourceId: string(pick(source, "sourceId")), entityKey: string(pick(source, "entityKey")),
    reportKey: string(pick(source, "reportKey")), fileName: string(pick(source, "fileName")),
    displayName: string(pick(source, "displayName")), subject: (pick(source, "subject") as string | null) ?? null,
    size: number(pick(source, "size")) ?? 0, sha256: string(pick(source, "sha256")),
    lastModifiedUtc: string(pick(source, "lastModifiedUtc")), isImportable: bool(pick(source, "isImportable")),
    validationReason: (pick(source, "validationReason") as string | null) ?? null,
    isImported: bool(pick(source, "isImported")),
  };
}

function formData(request: Omit<CreateCrystalReportRequest, "file"> & { file: File }) {
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
    return list(response).items;
  },
  render: (id: string, request: RenderCrystalReportRequest) =>
    apiService.postBlob(apiRoutes.crystalReports.render(id), request, "application/pdf", 120_000),
  async listRoles(): Promise<CrystalReportRoleOption[]> {
    const response = await apiService.get<unknown>(apiRoutes.roles.getAll);
    const root = unwrap(response);
    const source = Array.isArray(response) ? response : (pick(root, "data") ?? pick(root, "items"));
    if (!Array.isArray(source)) return [];
    return source.map((value) => {
      const role = unwrap(value);
      return { id: string(pick(role, "id")), name: string(pick(role, "name")) };
    }).filter((role) => role.id && role.name);
  },
  async listForManagement(query: { entityKey?: string; search?: string; status?: CrystalReportStatus; page?: number; pageSize?: number }) {
    return list(await apiService.get<unknown>(apiRoutes.crystalReports.manage, query));
  },
  async get(id: string): Promise<CrystalReportDetail> {
    const source = unwrap(await apiService.get<unknown>(apiRoutes.crystalReports.getForManagement(id)));
    return { ...report(source), versions: Array.isArray(pick(source, "versions")) ? (pick(source, "versions") as unknown[]).map(version) : [],
      access: Array.isArray(pick(source, "access")) ? pick(source, "access") as CrystalReportAccessGrant[] : [] };
  },
  async create(request: CreateCrystalReportRequest) { return report(await apiService.post<unknown>(apiRoutes.crystalReports.create, formData(request))); },
  async listLegacyCandidates(entityKey?: string): Promise<DiscoveredCrystalReport[]> {
    const response = await apiService.get<unknown>(apiRoutes.crystalReports.legacyCandidates, entityKey ? { entityKey } : {});
    return Array.isArray(response) ? response.map(discovered) : [];
  },
  async importLegacy(request: ImportDiscoveredCrystalReportRequest) {
    return report(await apiService.post<unknown>(apiRoutes.crystalReports.importLegacy, request));
  },
  async uploadVersion(id: string, file: File) { const body = new FormData(); body.append("file", file); return version(await apiService.post<unknown>(apiRoutes.crystalReports.versions(id), body)); },
  async getVersions(id: string) { const response = await apiService.get<unknown>(apiRoutes.crystalReports.versions(id)); return Array.isArray(response) ? response.map(version) : []; },
  publishVersion: (id: string, versionId: string, rowVersion: string) => apiService.post<void>(apiRoutes.crystalReports.publishVersion(id, versionId), { rowVersion }),
  getAccess: (id: string) => apiService.get<CrystalReportAccessGrant[]>(apiRoutes.crystalReports.access(id)),
  saveAccess: (id: string, grants: CrystalReportAccessGrant[], rowVersion: string) => apiService.put<void>(apiRoutes.crystalReports.access(id), { grants, rowVersion }),
  archive: (id: string, rowVersion: string) => apiService.delete<void>(apiRoutes.crystalReports.archive(id), { rowVersion }),
  download: (id: string) => apiService.getBlob(apiRoutes.crystalReports.download(id)),
  downloadVersion: (id: string, versionId: string) => apiService.getBlob(apiRoutes.crystalReports.downloadVersion(id, versionId)),
};
