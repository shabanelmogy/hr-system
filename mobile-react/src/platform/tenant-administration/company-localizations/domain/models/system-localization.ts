import type { CompanyLocalizationSettings, CompanyLocalizationRuntime } from './company-localization';
export type SystemLocalizationSettings = Omit<CompanyLocalizationSettings, 'tenantId' | 'companyId' | 'defaultLanguage'>;
export type SystemLocalizationRuntime = Omit<CompanyLocalizationRuntime, 'tenantId' | 'companyId' | 'defaultLanguage'>;
