import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { OrganizationalResource } from '../types/organizational-structure';

export const createOrganizationalStructureSchema = (resource: OrganizationalResource, t: TFunction) => z.object({
  code: z.string().trim().min(1, t('validation.required')).max(50).regex(/^[A-Za-z0-9._-]+$/, t('organizationalStructure.validation.code')),
  nameEn: z.string().trim().min(1, t('validation.required')).max(200),
  nameAr: z.string().trim().min(1, t('validation.required')).max(200),
  descriptionEn: z.string().max(2000), descriptionAr: z.string().max(2000),
  branchId: z.number().int().nonnegative(), parentDepartmentId: z.number().int().nonnegative(), departmentId: z.number().int().nonnegative(),
  divisionId: z.number().int().nonnegative(), jobTitleId: z.number().int().nonnegative(), jobLevelId: z.number().int().nonnegative(), positionId: z.number().int().nonnegative(),
  costCenterCode: z.string().max(50), timeZoneId: z.string().max(128), openedOn: z.string(), email: z.string(), phone: z.string().max(50),
  isHeadquarters: z.boolean(), levelOrder: z.string(), minSalary: z.string(), maxSalary: z.string(), currencyCode: z.string().max(3),
  canManageOthers: z.boolean(), isManagementLevel: z.boolean(), targetHeadcount: z.string(), version: z.string().max(30),
  purposeEn: z.string().max(4000), purposeAr: z.string().max(4000), responsibilitiesEn: z.string().max(8000), responsibilitiesAr: z.string().max(8000),
  requirementsEn: z.string().max(8000), requirementsAr: z.string().max(8000), requiredSkills: z.string().max(4000), requiredEducation: z.string().max(2000),
  minExperienceYears: z.string(), preferredQualificationsEn: z.string().max(4000), preferredQualificationsAr: z.string().max(4000), revisionNotes: z.string().max(2000),
}).superRefine((values, context) => {
  const requireId = (field: 'branchId' | 'departmentId' | 'divisionId' | 'jobTitleId' | 'jobLevelId' | 'positionId') => {
    if (values[field] <= 0) context.addIssue({ code: 'custom', path: [field], message: t('validation.required') });
  };
  if (resource === 'departments') requireId('branchId');
  if (resource === 'divisions') requireId('departmentId');
  if (resource === 'positions') { requireId('divisionId'); requireId('jobTitleId'); requireId('jobLevelId'); }
  if (resource === 'job-descriptions') { requireId('positionId'); if (!values.version.trim()) context.addIssue({ code: 'custom', path: ['version'], message: t('validation.required') }); }
  const min = values.minSalary ? Number(values.minSalary) : undefined; const max = values.maxSalary ? Number(values.maxSalary) : undefined;
  if (min != null && max != null && min > max) context.addIssue({ code: 'custom', path: ['maxSalary'], message: t('organizationalStructure.validation.salaryRange') });
});

export const createJobDescriptionDecisionSchema = (mode: 'approve' | 'reject', t: TFunction) => z.object({
  effectiveDate: z.string(), expiryDate: z.string(), reason: z.string().max(1000),
}).superRefine((values, context) => {
  if (mode === 'approve') {
    if (!values.effectiveDate.trim()) context.addIssue({ code: 'custom', path: ['effectiveDate'], message: t('validation.required') });
    if (values.expiryDate && values.expiryDate < values.effectiveDate) context.addIssue({ code: 'custom', path: ['expiryDate'], message: t('validation.endDateBeforeStart') });
  }
  if (mode === 'reject' && !values.reason.trim()) context.addIssue({ code: 'custom', path: ['reason'], message: t('validation.required') });
});
