import type { TFunction } from 'i18next';
import {
  DEFAULT_IMPORT_MAX_BYTES,
  parseNativeSpreadsheet,
  type NativeSpreadsheetFile,
  type SpreadsheetImportPolicy,
} from '@/src/shared/importing';
import type { OrganizationalResource, OrganizationalStructureRequest, OrganizationalStructureLookup } from '../../types/organizational-structure';

export const ORGANIZATIONAL_IMPORT_MAX_ROWS = 100;
export const ORGANIZATIONAL_IMPORT_MAX_BYTES = DEFAULT_IMPORT_MAX_BYTES;
const BASE_HEADERS = ['nameAr', 'nameEn', 'code'] as const;
const EXTRA_HEADERS: Partial<Record<OrganizationalResource, readonly string[]>> = {
  departments: ['parentCode'], divisions: ['parentCode'], positions: ['parentCode', 'jobTitleCode', 'jobLevelCode'], 'job-descriptions': ['parentCode'], 'job-levels': ['levelOrder'],
};
export type OrganizationalImportHeader = 'nameAr' | 'nameEn' | 'code' | 'parentCode' | 'jobTitleCode' | 'jobLevelCode' | 'levelOrder';
export type OrganizationalImportStatus = 'ready' | 'invalid' | 'uploaded' | 'failed' | 'uncertain';
export interface OrganizationalImportRow { rowNumber: number; values: Record<OrganizationalImportHeader, string>; request: OrganizationalStructureRequest | null; status: OrganizationalImportStatus; error?: string; }

export function getOrganizationalImportHeaders(resource: OrganizationalResource): readonly OrganizationalImportHeader[] { return [...BASE_HEADERS, ...(EXTRA_HEADERS[resource] ?? [])] as OrganizationalImportHeader[]; }
export function getOrganizationalImportPolicy(resource: OrganizationalResource): SpreadsheetImportPolicy { return { headers: getOrganizationalImportHeaders(resource), maxRows: ORGANIZATIONAL_IMPORT_MAX_ROWS, maxBytes: ORGANIZATIONAL_IMPORT_MAX_BYTES, worksheetIndex: 0 }; }
export function getOrganizationalParentResource(resource: OrganizationalResource): OrganizationalResource | null { if (resource === 'departments') return 'branches'; if (resource === 'divisions') return 'departments'; if (resource === 'positions') return 'divisions'; if (resource === 'job-descriptions') return 'positions'; return null; }
export function getOrganizationalImportTemplateFile(resource: OrganizationalResource): string { return `${resource}-import-template.xlsx`; }

export async function parseOrganizationalImport(file: NativeSpreadsheetFile, resource: OrganizationalResource, lookups: readonly OrganizationalStructureLookup[], jobTitles: readonly OrganizationalStructureLookup[], jobLevels: readonly OrganizationalStructureLookup[], t: TFunction): Promise<OrganizationalImportRow[]> {
  const { rows } = await parseNativeSpreadsheet(file, getOrganizationalImportPolicy(resource));
  const headers = getOrganizationalImportHeaders(resource);
  const seen = new Set<string>();
  return rows.map(({ rowNumber, values }) => {
    const mapped = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])) as Record<OrganizationalImportHeader, string>;
    const request: OrganizationalStructureRequest = { code: mapped.code, nameEn: mapped.nameEn, nameAr: mapped.nameAr };
    const parentId = lookup(lookups, mapped.parentCode);
    if (resource === 'departments') request.branchId = parentId;
    if (resource === 'divisions') request.departmentId = parentId;
    if (resource === 'positions') { request.divisionId = parentId; request.jobTitleId = lookup(jobTitles, mapped.jobTitleCode); request.jobLevelId = lookup(jobLevels, mapped.jobLevelCode); }
    if (resource === 'job-descriptions') { request.positionId = parentId; request.version = mapped.code; }
    if (resource === 'job-levels' && mapped.levelOrder.trim()) request.levelOrder = Number(mapped.levelOrder);
    const requiredParent = resource === 'departments' ? request.branchId : resource === 'divisions' ? request.departmentId : resource === 'positions' ? request.divisionId && request.jobTitleId && request.jobLevelId : resource === 'job-descriptions' ? request.positionId : true;
    const key = normalize(mapped.code);
    let error: string | undefined;
    if (!mapped.nameAr || !mapped.nameEn || !mapped.code) error = t('validation.required');
    else if (!/^[A-Za-z0-9._-]+$/.test(mapped.code)) error = t('organizationalStructure.validation.code');
    else if (!requiredParent) error = t('organizationalStructure.import.parentNotFound');
    else if (resource === 'job-levels' && (!mapped.levelOrder.trim() || !Number.isInteger(Number(mapped.levelOrder)) || Number(mapped.levelOrder) < 0)) error = t('validation.required');
    else if (seen.has(key)) error = t('organizationalStructure.import.duplicate');
    seen.add(key);
    return { rowNumber, values: mapped, request: error ? null : request, status: error ? 'invalid' : 'ready', error };
  });
}
function lookup(items: readonly OrganizationalStructureLookup[], code: string): number | undefined { const normalized = normalize(code); return items.find((item) => normalize(item.code) === normalized)?.id; }
function normalize(value: string): string { return value.trim().toLocaleUpperCase('en-US'); }
