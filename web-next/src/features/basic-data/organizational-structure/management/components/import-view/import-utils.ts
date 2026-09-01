import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseSpreadsheetImportFile,
  type SpreadsheetImportPolicy,
} from "@/shared/services/excelService";
import type { OrganizationalResource, OrganizationalStructureMutation } from "../../types/OrganizationalStructure";

export const ORGANIZATIONAL_IMPORT_MAX_ROWS = 100;
export const ORGANIZATIONAL_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;

const BASE_HEADERS = ["nameAr", "nameEn", "code"] as const;
const PARENT_HEADERS = {
  departments: ["parentCode"],
  divisions: ["parentCode"],
  positions: ["parentCode", "jobTitleCode", "jobLevelCode"],
  "job-descriptions": ["parentCode"],
  "job-levels": ["levelOrder"],
} as const;

export type OrganizationalImportHeader =
  | "nameAr" | "nameEn" | "code" | "parentCode" | "jobTitleCode" | "jobLevelCode" | "levelOrder";

export interface OrganizationalImportRow {
  rowNumber: number;
  values: Record<OrganizationalImportHeader, string>;
  nameAr: string;
  nameEn: string;
  code: string;
  status: "pending" | "invalid" | "uploaded" | "failed" | "uncertain";
  errorMessage?: string;
}

export function getOrganizationalImportHeaders(resource: OrganizationalResource): readonly OrganizationalImportHeader[] {
  return [...BASE_HEADERS, ...(PARENT_HEADERS[resource as keyof typeof PARENT_HEADERS] ?? [])] as OrganizationalImportHeader[];
}

export function getOrganizationalImportPolicy(resource: OrganizationalResource): SpreadsheetImportPolicy {
  return {
    headers: getOrganizationalImportHeaders(resource),
    maxRows: ORGANIZATIONAL_IMPORT_MAX_ROWS,
    maxBytes: ORGANIZATIONAL_IMPORT_MAX_BYTES,
    worksheetIndex: 0,
  };
}

export async function parseOrganizationalImportFile(
  file: File,
  resource: OrganizationalResource,
): Promise<OrganizationalImportRow[]> {
  const headers = getOrganizationalImportHeaders(resource);
  const { rows } = await parseSpreadsheetImportFile(file, getOrganizationalImportPolicy(resource));
  return rows.map(({ rowNumber, values }) => {
    const mapped = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as Record<OrganizationalImportHeader, string>;
    return { rowNumber, values: mapped, nameAr: mapped.nameAr, nameEn: mapped.nameEn, code: mapped.code, status: "pending" };
  });
}

export function getOrganizationalImportTemplateFile(resource: OrganizationalResource): string {
  return `${resource}-import-template.xlsx`;
}

export function getOrganizationalParentResource(resource: OrganizationalResource): OrganizationalResource | null {
  if (resource === "departments") return "branches";
  if (resource === "divisions") return "departments";
  if (resource === "positions") return "divisions";
  if (resource === "job-descriptions") return "positions";
  return null;
}

export function lookupByCode(lookups: readonly { id: number; code: string }[], code: string): number | undefined {
  const normalized = code.trim().toLocaleUpperCase("en-US");
  return lookups.find((lookup) => lookup.code.trim().toLocaleUpperCase("en-US") === normalized)?.id;
}

export function toOrganizationalImportRequest(
  resource: OrganizationalResource,
  row: OrganizationalImportRow,
  parentLookups: readonly { id: number; code: string }[],
  jobTitleLookups: readonly { id: number; code: string }[],
  jobLevelLookups: readonly { id: number; code: string }[],
): OrganizationalStructureMutation | null {
  const { values } = row;
  const request: OrganizationalStructureMutation = {
    code: values.code,
    nameEn: values.nameEn,
    nameAr: values.nameAr,
  };
  const parentId = lookupByCode(parentLookups, values.parentCode);
  if (resource === "departments") request.branchId = parentId;
  if (resource === "divisions") request.departmentId = parentId;
  if (resource === "positions") {
    request.divisionId = parentId;
    request.jobTitleId = lookupByCode(jobTitleLookups, values.jobTitleCode);
    request.jobLevelId = lookupByCode(jobLevelLookups, values.jobLevelCode);
  }
  if (resource === "job-descriptions") {
    request.positionId = parentId;
    request.version = values.code;
  }
  if (resource === "job-levels" && values.levelOrder.trim()) request.levelOrder = Number(values.levelOrder);
  return request;
}
