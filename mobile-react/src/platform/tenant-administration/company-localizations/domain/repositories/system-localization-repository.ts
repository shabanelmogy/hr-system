import type { SystemLocalizationSettings, SystemLocalizationRuntime } from '../models/system-localization';
import type { CompanyLocalizationTexts, CompanyLocalizationTextQuery, SetCompanyLocalizationText, ResetCompanyLocalizationText } from '../models/company-localization';
export interface SystemLocalizationRepository {
 getSettings():Promise<SystemLocalizationSettings>;
 getTexts(query:CompanyLocalizationTextQuery):Promise<CompanyLocalizationTexts>;
 getRuntime():Promise<SystemLocalizationRuntime>;
 setText(request:SetCompanyLocalizationText):Promise<void>;
 resetText(request:ResetCompanyLocalizationText):Promise<void>;
}
