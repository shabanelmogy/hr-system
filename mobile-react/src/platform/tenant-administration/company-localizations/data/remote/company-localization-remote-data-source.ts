import { apiService } from '@/src/core/api';
import { companyUiCatalogVersion } from '@/src/core/localization/company-ui-catalog-version';
import type { CompanyLocalizationRuntime, CompanyLocalizationScope, CompanyLocalizationSettings, CompanyLocalizationTexts, CompanyLocalizationTextQuery, ResetCompanyLocalizationText, SetCompanyLocalizationDefault, SetCompanyLocalizationText } from '../../domain/models/company-localization';
import { companyLocalizationEndpoints as endpoints } from './company-localization-endpoints';
import { runtimeSchema, settingsSchema, textsSchema } from './company-localization-schemas';
export interface CompanyLocalizationRemoteDataSource { getSettings(scope:CompanyLocalizationScope):Promise<CompanyLocalizationSettings>;getTexts(query:CompanyLocalizationTextQuery):Promise<CompanyLocalizationTexts>;getRuntime(scope:CompanyLocalizationScope):Promise<CompanyLocalizationRuntime>;setDefault(request:SetCompanyLocalizationDefault):Promise<void>;setText(request:SetCompanyLocalizationText):Promise<void>;resetText(request:ResetCompanyLocalizationText):Promise<void>; }
const assertScope=(value:{tenantId:string;companyId:number},scope:CompanyLocalizationScope)=>{if(value.tenantId!==scope.tenantId||value.companyId!==scope.companyId)throw new Error('Company localization response does not match the active scope.');};
export const companyLocalizationRemoteDataSource:CompanyLocalizationRemoteDataSource={
 async getSettings(scope){const value=settingsSchema.parse(await apiService.get<unknown>(endpoints.settings));assertScope(value,scope);return value;},
 async getTexts(query){return textsSchema.parse(await apiService.get<unknown>(endpoints.texts,{params:query}));},
 async getRuntime(scope){const value=runtimeSchema.parse(await apiService.get<unknown>(endpoints.runtime,{params:{client:'mobile',catalogVersion:companyUiCatalogVersion}}));assertScope(value,scope);if(value.catalogVersion!==companyUiCatalogVersion)throw new Error('Company localization catalog version is incompatible.');return value;},
 async setDefault(request){await apiService.put<void,SetCompanyLocalizationDefault>(endpoints.default,request);},
 async setText(request){await apiService.put<void,SetCompanyLocalizationText>(endpoints.text,request);},
 async resetText(request){await apiService.post<void,ResetCompanyLocalizationText>(endpoints.reset,request);},
};
