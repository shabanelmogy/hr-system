export const organizationalResources = ['branches', 'departments', 'divisions', 'job-titles', 'job-levels', 'positions', 'job-descriptions', 'cost-centers', 'currencies'] as const;
export type OrganizationalResource = (typeof organizationalResources)[number];
export type OrganizationalStatus = 'active' | 'archived' | 'all' | 'draft' | 'approved' | 'rejected' | 'expired';
export type OrganizationalSearchField = 'all' | 'nameAr' | 'nameEn' | 'code' | 'parent';
export type OrganizationalSearchOperator = 'contains' | 'doesNotContain' | 'equals' | 'doesNotEqual' | 'startsWith' | 'endsWith';
export type OrganizationalSortColumn = 'nameEn' | 'nameAr' | 'code' | 'parent' | 'createdOn';

export interface JobDutyItem {
  textEn: string;
  textAr: string;
  order: number;
}

export interface JobDutySection {
  sectionTitleEn: string;
  sectionTitleAr: string;
  weightPercentage?: number;
  items: JobDutyItem[];
}

export interface JobSkillItem {
  skillName: string;
  proficiencyLevel: string;
  isMandatory: boolean;
}

export interface JobEducationRequirement {
  degreeLevel: string;
  fieldOfStudy: string;
  isRequired: boolean;
}

export interface OrganizationalStructureRequest {
  code: string; nameEn: string; nameAr: string;
  descriptionEn?: string; descriptionAr?: string;
  branchId?: number; parentDepartmentId?: number; departmentId?: number;
  divisionId?: number; jobTitleId?: number; jobLevelId?: number; positionId?: number;
  managerId?: number; costCenterCode?: string; timeZoneId?: string; openedOn?: string;
  email?: string; phone?: string; isHeadquarters?: boolean;
  levelOrder?: number; minSalary?: number; maxSalary?: number; currencyCode?: string;
  canManageOthers?: boolean; isManagementLevel?: boolean; targetHeadcount?: number;
  version?: string; purposeEn?: string; purposeAr?: string;
  responsibilitiesEn?: string; responsibilitiesAr?: string;
  requirementsEn?: string; requirementsAr?: string;
  preferredQualificationsEn?: string; preferredQualificationsAr?: string;
  requiredSkills?: string; requiredEducation?: string; minExperienceYears?: number; revisionNotes?: string;
  dutySections?: JobDutySection[];
  skills?: JobSkillItem[];
  educationRequirements?: JobEducationRequirement[];
  parentCostCenterId?: number;
  symbol?: string;
  exchangeRateToDefault?: number;
  isDefault?: boolean;
}
export interface OrganizationalStructureItem extends OrganizationalStructureRequest {
  id: number; resource: OrganizationalResource; isDeleted: boolean; createdOn: string; updatedOn?: string;
  isCentralized?: boolean;
  branchNameEn?: string; branchNameAr?: string; parentNameEn?: string; parentNameAr?: string;
  departmentNameEn?: string; departmentNameAr?: string; divisionNameEn?: string; divisionNameAr?: string;
  jobTitleNameEn?: string; jobTitleNameAr?: string; jobLevelNameEn?: string; jobLevelNameAr?: string;
  positionCode?: string; closedOn?: string; isOperationallyActive: boolean;
  jobDescriptionStatus?: number | string; effectiveDate?: string; expiryDate?: string; decisionReason?: string;
}
export interface OrganizationalStructureLookup { id: number; code: string; nameEn: string; nameAr: string; }
export interface OrganizationalStructureQuery {
  resource: OrganizationalResource; pageNumber: number; pageSize: number; search: string;
  searchField: OrganizationalSearchField; searchOperator: OrganizationalSearchOperator;
  status: OrganizationalStatus; sortBy: OrganizationalSortColumn; sortDirection: 'asc' | 'desc'; parentId?: number;
}

export interface OrganizationalChangeLogItem {
  id?: string | number;
  changeLogId: string | number;
  entityName?: string;
  key: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  changedAt: string;
  changedByPc?: string;
}
