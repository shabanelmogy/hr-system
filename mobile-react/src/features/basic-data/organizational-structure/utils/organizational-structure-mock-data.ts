import { getNextMockSample } from '@/src/shared/utils/mockData';
import type {
  OrganizationalResource,
  OrganizationalStructureLookup,
  OrganizationalStructureRequest,
} from '../types/organizational-structure';

export type OrganizationalStructureMockLookups = Partial<Record<OrganizationalResource, readonly OrganizationalStructureLookup[]>>;

const branchSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'BR-CAI-001', nameEn: 'Cairo Headquarters', nameAr: 'المقر الرئيسي بالقاهرة', timeZoneId: 'Africa/Cairo', openedOn: '2026-01-01', email: 'cairo@example.com', phone: '+20 2 0000 0000', isHeadquarters: true },
  { code: 'BR-ALEX-001', nameEn: 'Alexandria Branch', nameAr: 'فرع الإسكندرية', timeZoneId: 'Africa/Cairo', openedOn: '2026-02-01', email: 'alexandria@example.com', phone: '+20 3 0000 0000', isHeadquarters: false },
];

const departmentSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'FIN', nameEn: 'Finance', nameAr: 'المالية', costCenterCode: 'CC-FIN', descriptionEn: 'Financial control and accounting operations.', descriptionAr: 'الرقابة المالية وعمليات المحاسبة.' },
  { code: 'HR', nameEn: 'Human Resources', nameAr: 'الموارد البشرية', costCenterCode: 'CC-HR', descriptionEn: 'People operations and employee services.', descriptionAr: 'عمليات الموظفين وخدمات الموارد البشرية.' },
];

const divisionSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'AP', nameEn: 'Accounts Payable', nameAr: 'الحسابات الدائنة', costCenterCode: 'CC-FIN-AP', descriptionEn: 'Supplier invoices and payment controls.', descriptionAr: 'فواتير الموردين وضوابط المدفوعات.' },
  { code: 'TA', nameEn: 'Talent Acquisition', nameAr: 'استقطاب المواهب', costCenterCode: 'CC-HR-TA', descriptionEn: 'Recruitment and hiring operations.', descriptionAr: 'عمليات الاستقطاب والتعيين.' },
];

const jobTitleSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'SENIOR-ACCOUNTANT', nameEn: 'Senior Accountant', nameAr: 'محاسب أول' },
  { code: 'HR-SPECIALIST', nameEn: 'HR Specialist', nameAr: 'أخصائي موارد بشرية' },
  { code: 'SOFTWARE-ENGINEER', nameEn: 'Software Engineer', nameAr: 'مهندس برمجيات' },
];

const jobLevelSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'L3', nameEn: 'Professional III', nameAr: 'أخصائي ثالث', descriptionEn: 'Experienced individual contributor level.', descriptionAr: 'مستوى موظف متخصص ذي خبرة.', levelOrder: 3, minSalary: 15000, maxSalary: 25000, currencyCode: 'EGP', canManageOthers: false, isManagementLevel: false },
  { code: 'M1', nameEn: 'First Line Manager', nameAr: 'مدير صف أول', descriptionEn: 'Leads a small operational team.', descriptionAr: 'يقود فريقًا تشغيليًا صغيرًا.', levelOrder: 4, minSalary: 25000, maxSalary: 40000, currencyCode: 'EGP', canManageOthers: true, isManagementLevel: true },
];

const positionSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'FIN-CAI-001', nameEn: 'Senior Accountant — Cairo', nameAr: 'محاسب أول — القاهرة', targetHeadcount: 2 },
  { code: 'HR-CAI-001', nameEn: 'HR Specialist — Cairo', nameAr: 'أخصائي موارد بشرية — القاهرة', targetHeadcount: 1 },
];

const jobDescriptionSamples: readonly OrganizationalStructureRequest[] = [
  { code: '1.0', version: '1.0', nameEn: 'Senior Accountant', nameAr: 'محاسب أول', purposeEn: 'Maintain accurate accounting records and payment controls.', purposeAr: 'الحفاظ على دقة السجلات المحاسبية وضوابط المدفوعات.', responsibilitiesEn: 'Review invoices, reconcile balances, and prepare reports.', responsibilitiesAr: 'مراجعة الفواتير وتسوية الأرصدة وإعداد التقارير.', requirementsEn: 'Bachelor\'s degree in accounting and ERP experience.', requirementsAr: 'مؤهل جامعي في المحاسبة وخبرة في أنظمة ERP.', requiredSkills: 'Accounting, Excel, ERP', requiredEducation: 'Bachelor\'s degree in Accounting', minExperienceYears: 3, preferredQualificationsEn: 'Professional accounting certification is preferred.', preferredQualificationsAr: 'يفضل الحصول على شهادة مهنية في المحاسبة.', revisionNotes: 'Initial approved-ready sample.' },
  { code: '1.0', version: '1.0', nameEn: 'HR Specialist', nameAr: 'أخصائي موارد بشرية', purposeEn: 'Support employee services and recruitment administration.', purposeAr: 'دعم خدمات الموظفين وإدارة عمليات التوظيف.', responsibilitiesEn: 'Coordinate interviews, maintain records, and support onboarding.', responsibilitiesAr: 'تنسيق المقابلات وحفظ السجلات ودعم التهيئة.', requirementsEn: 'Human resources experience and strong communication skills.', requirementsAr: 'خبرة في الموارد البشرية ومهارات تواصل قوية.', requiredSkills: 'Recruitment, Communication, HRIS', requiredEducation: 'Bachelor\'s degree', minExperienceYears: 2, preferredQualificationsEn: 'HR certification is preferred.', preferredQualificationsAr: 'يفضل الحصول على شهادة في الموارد البشرية.', revisionNotes: 'Initial approved-ready sample.' },
];

const costCenterSamples: readonly OrganizationalStructureRequest[] = [
  { code: 'CC-HQ', nameEn: 'Headquarters Cost Center', nameAr: 'مركز تكلفة الإدارة العامة', descriptionEn: 'Corporate central cost center.', descriptionAr: 'مركز التكلفة الرئيسي للمقر الإداري.' },
  { code: 'CC-TECH', nameEn: 'Technology & Development', nameAr: 'مركز تكلفة التكنولوجيا والتطوير', descriptionEn: 'Technology and systems allocation.', descriptionAr: 'توزيعات الأنظمة وتكنولوجيا المعلومات.' },
  { code: 'CC-OPS', nameEn: 'Operations & Logistics', nameAr: 'مركز تكلفة العمليات واللوجستيات', descriptionEn: 'Field and supply operations.', descriptionAr: 'عمليات التشغيل والإمداد.' },
];

const currencySamples: readonly OrganizationalStructureRequest[] = [
  { code: 'USD', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', exchangeRateToDefault: 1, isDefault: true },
  { code: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'جنيه مصري', symbol: 'EGP', exchangeRateToDefault: 0.02, isDefault: false },
  { code: 'SAR', nameEn: 'Saudi Riyal', nameAr: 'ريال سعودي', symbol: 'SAR', exchangeRateToDefault: 0.27, isDefault: false },
];

const firstId = (lookups: OrganizationalStructureMockLookups, resource: OrganizationalResource): number | undefined => lookups[resource]?.[0]?.id;

/** Returns a development-only sample and resolves required relationships from active lookup data. */
export function getNextOrganizationalStructureMockData(resource: OrganizationalResource, usedIndexes: Set<number>, lookups: OrganizationalStructureMockLookups): OrganizationalStructureRequest {
  switch (resource) {
    case 'branches': return getNextMockSample(branchSamples, usedIndexes);
    case 'departments': return { ...getNextMockSample(departmentSamples, usedIndexes), branchId: firstId(lookups, 'branches') };
    case 'divisions': return { ...getNextMockSample(divisionSamples, usedIndexes), departmentId: firstId(lookups, 'departments') };
    case 'job-titles': return getNextMockSample(jobTitleSamples, usedIndexes);
    case 'job-levels': return getNextMockSample(jobLevelSamples, usedIndexes);
    case 'positions': return { ...getNextMockSample(positionSamples, usedIndexes), divisionId: firstId(lookups, 'divisions'), jobTitleId: firstId(lookups, 'job-titles'), jobLevelId: firstId(lookups, 'job-levels') };
    case 'job-descriptions': return { ...getNextMockSample(jobDescriptionSamples, usedIndexes), positionId: firstId(lookups, 'positions') };
    case 'cost-centers': return getNextMockSample(costCenterSamples, usedIndexes);
    case 'currencies': return getNextMockSample(currencySamples, usedIndexes);
  }
}

export function organizationalStructureMockDependenciesReady(resource: OrganizationalResource, lookups: OrganizationalStructureMockLookups): boolean {
  const required: Partial<Record<OrganizationalResource, readonly OrganizationalResource[]>> = {
    departments: ['branches'], divisions: ['departments'], positions: ['divisions', 'job-titles', 'job-levels'], 'job-descriptions': ['positions'],
  };
  return (required[resource] ?? []).every((dependency) => Boolean(lookups[dependency]?.length));
}
