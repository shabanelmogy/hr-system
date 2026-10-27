export type CompanyLocalizationLanguage = 'en' | 'ar';
export type CompanyLocalizationStatus = 'all' | 'missing' | 'customized';
export interface CompanyLocalizationScope { tenantId: string; companyId: number; }
export interface CompanyLocalizationSource { id: string; client: 'web' | 'mobile'; namespace: string; }
export interface CompanyLocalizationSettings { tenantId: string; companyId: number; defaultLanguage: CompanyLocalizationLanguage; revision: number; languages: CompanyLocalizationLanguage[]; sources: CompanyLocalizationSource[]; catalogVersions: Record<string, string>; }
export interface CompanyLocalizationText { key: string; baseValue: string; targetValue: string; shippedValue: string; isCustomized: boolean; }
export interface CompanyLocalizationTexts { revision: number; items: CompanyLocalizationText[]; totalCount: number; page: number; pageSize: number; catalogVersion: string; }
export interface CompanyLocalizationRuntime { tenantId: string; companyId: number; defaultLanguage: CompanyLocalizationLanguage; revision: number; catalogVersion: string; overrides: { namespace: string; language: CompanyLocalizationLanguage; key: string; value: string; }[]; }
export interface CompanyLocalizationTextQuery { source: string; baseLanguage: CompanyLocalizationLanguage; targetLanguage: CompanyLocalizationLanguage; search: string; status: CompanyLocalizationStatus; page: number; pageSize: number; }
export interface SetCompanyLocalizationDefault { language: CompanyLocalizationLanguage; expectedRevision: number; }
export interface SetCompanyLocalizationText { source: string; language: CompanyLocalizationLanguage; key: string; value: string; expectedRevision: number; }
export type ResetCompanyLocalizationText = Omit<SetCompanyLocalizationText, 'value'>;
