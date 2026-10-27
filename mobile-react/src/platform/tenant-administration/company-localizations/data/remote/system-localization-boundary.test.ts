import { companyUiCatalogVersion } from '@/src/core/localization/company-ui-catalog-version';
import { systemLocalizationRemoteDataSource as remote, systemSettingsSchema } from './system-localization-remote-data-source';
import { DefaultSystemLocalizationRepository } from '../repositories/default-system-localization-repository';
const mockGet=jest.fn();const mockPut=jest.fn();
jest.mock('@/src/core/api',()=>({apiService:{get:(...args:unknown[])=>mockGet(...args),put:(...args:unknown[])=>mockPut(...args)}}));
beforeEach(()=>jest.clearAllMocks());
it('uses honest global settings without company scope',async()=>{
 const settings={revision:0,languages:['en','ar'],sources:[],catalogVersions:{web:'v',mobile:companyUiCatalogVersion}};
 mockGet.mockResolvedValue(settings);await expect(remote.getSettings()).resolves.toEqual(settings);expect(mockGet).toHaveBeenCalledWith('system-ui-localizations/settings');
 expect(systemSettingsSchema.safeParse({...settings,tenantId:'fake',companyId:0,defaultLanguage:'en'}).success).toBe(false);
});
it('validates runtime fingerprint and does not accept stale catalogs',async()=>{
 mockGet.mockResolvedValue({revision:0,catalogVersion:'obsolete',overrides:[]});await expect(remote.getRuntime()).rejects.toThrow('incompatible');
 mockGet.mockResolvedValue({revision:0,catalogVersion:companyUiCatalogVersion,overrides:[]});await expect(remote.getRuntime()).resolves.toEqual(expect.objectContaining({revision:0}));
});
it('does not replay global writes offline',()=>{const repository=new DefaultSystemLocalizationRepository(remote,()=>false);expect(()=>repository.setText({source:'mobile:translation',language:'ar',key:'systemUiTexts.title',value:'عنوان',expectedRevision:0})).toThrow('live connection');expect(mockPut).not.toHaveBeenCalled();});
