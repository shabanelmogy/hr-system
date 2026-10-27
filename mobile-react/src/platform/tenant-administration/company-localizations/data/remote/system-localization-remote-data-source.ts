import { apiService } from '@/src/core/api';
import { companyUiCatalogVersion } from '@/src/core/localization/company-ui-catalog-version';
import type { SystemLocalizationRepository } from '../../domain/repositories/system-localization-repository';
import { systemLocalizationEndpoints as endpoints } from './system-localization-endpoints';
import { settingsSchema, runtimeSchema, textsSchema } from './company-localization-schemas';
export const systemSettingsSchema=settingsSchema.omit({tenantId:true,companyId:true,defaultLanguage:true}).strict();
export const systemRuntimeSchema=runtimeSchema.omit({tenantId:true,companyId:true,defaultLanguage:true}).strict();
export const systemLocalizationRemoteDataSource:SystemLocalizationRepository={
 async getSettings(){return systemSettingsSchema.parse(await apiService.get<unknown>(endpoints.settings));},
 async getTexts(query){return textsSchema.parse(await apiService.get<unknown>(endpoints.texts,{params:query}));},
 async getRuntime(){const result=systemRuntimeSchema.parse(await apiService.get<unknown>(endpoints.runtime,{params:{client:'mobile',catalogVersion:companyUiCatalogVersion}}));if(result.catalogVersion!==companyUiCatalogVersion)throw new Error('System UI catalog is incompatible.');return result;},
 async setText(request){await apiService.put<void,typeof request>(endpoints.text,request);},
 async resetText(request){await apiService.post<void,typeof request>(endpoints.reset,request);},
};
