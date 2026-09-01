export const organizationalResources = [
  "branches",
  "departments",
  "divisions",
  "job-titles",
  "job-levels",
  "positions",
  "job-descriptions",
] as const;

export type OrganizationalResource = (typeof organizationalResources)[number];
export type OrganizationalView = "grid" | "cards" | "chart" | "report" | "import";
export type OrganizationalStatus = "active" | "archived" | "all" | "draft" | "approved" | "rejected" | "expired";
export type OrganizationalSearchField = "all" | "nameAr" | "nameEn" | "code" | "parent";
export type OrganizationalSearchOperator = "contains" | "doesNotContain" | "equals" | "doesNotEqual" | "startsWith" | "endsWith";

export function organizationalResourceSupportsParent(resource: OrganizationalResource): boolean {
  return resource === "departments" || resource === "divisions" || resource === "positions" || resource === "job-descriptions";
}

export interface OrganizationalStructureMutation {
  code: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  branchId?: number;
  parentDepartmentId?: number;
  departmentId?: number;
  divisionId?: number;
  jobTitleId?: number;
  jobLevelId?: number;
  positionId?: number;
  managerId?: number;
  costCenterCode?: string;
  timeZoneId?: string;
  openedOn?: string;
  email?: string;
  phone?: string;
  isHeadquarters?: boolean;
  levelOrder?: number;
  minSalary?: number;
  maxSalary?: number;
  currencyCode?: string;
  canManageOthers?: boolean;
  isManagementLevel?: boolean;
  targetHeadcount?: number;
  version?: string;
  purposeEn?: string;
  purposeAr?: string;
  responsibilitiesEn?: string;
  responsibilitiesAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  preferredQualificationsEn?: string;
  preferredQualificationsAr?: string;
  requiredSkills?: string;
  requiredEducation?: string;
  minExperienceYears?: number;
  revisionNotes?: string;
}

export interface OrganizationalStructureItem extends OrganizationalStructureMutation {
  id: number;
  resource: OrganizationalResource;
  isDeleted: boolean;
  createdOn: string;
  updatedOn?: string;
  branchNameEn?: string;
  branchNameAr?: string;
  parentNameEn?: string;
  parentNameAr?: string;
  departmentNameEn?: string;
  departmentNameAr?: string;
  divisionNameEn?: string;
  divisionNameAr?: string;
  jobTitleNameEn?: string;
  jobTitleNameAr?: string;
  jobLevelNameEn?: string;
  jobLevelNameAr?: string;
  positionCode?: string;
  closedOn?: string;
  isOperationallyActive: boolean;
  jobDescriptionStatus?: "Draft" | "Approved" | "Rejected" | "Expired" | number;
  effectiveDate?: string;
  expiryDate?: string;
  approvedByUserId?: string;
  decisionOn?: string;
  decisionReason?: string;
}

export interface OrganizationalStructureLookup {
  id: number;
  code: string;
  nameEn: string;
  nameAr: string;
}

export interface OrganizationalStructurePageQuery {
  resource: OrganizationalResource;
  pageNumber: number;
  pageSize: number;
  search?: string;
  status: OrganizationalStatus;
  sortBy: "nameEn" | "nameAr" | "code" | "parent" | "createdOn";
  sortDirection: "asc" | "desc";
  searchField?: OrganizationalSearchField;
  searchOperator?: OrganizationalSearchOperator;
  parentId?: number;
}

export interface PageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface OrganizationalStructurePageResponse {
  items: OrganizationalStructureItem[];
  metaData: PageMetadata;
}

export interface UpdateOrganizationalStructureMutation {
  resource: OrganizationalResource;
  id: number;
  request: OrganizationalStructureMutation;
}

export interface OrganizationalStructureBulkCreateResponse { createdCount: number; }
