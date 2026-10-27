import { act, renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';
import { useCompanyLocalization } from './use-company-localization';
const mockSettings=jest.fn();const mockTexts=jest.fn();const mockSet=jest.fn();let mockOnline=true;
const mockPermissions=['SystemUiTexts:View','SystemUiTexts:Edit','SystemUiTexts:Reset'];
jest.mock('@/src/core/localization',()=>({companyUiGeneration:()=>0,subscribeCompanyUiGeneration:()=>()=>undefined}));
jest.mock('@/src/core/offline',()=>({useConnectivity:()=>({isOnline:mockOnline})}));
jest.mock('@/src/platform/auth',()=>({useAuth:()=>({session:{userId:'global',roles:['super_admin'],permissions:mockPermissions},isServerAuthenticated:true,isSwitchingCompany:false}),permissions:{ViewSystemUiTexts:'SystemUiTexts:View',EditSystemUiTexts:'SystemUiTexts:Edit',ResetSystemUiTexts:'SystemUiTexts:Reset'}}));
jest.mock('../../composition/use-company-localization-use-cases',()=>({useCompanyLocalizationUseCases:()=>({})}));
jest.mock('../../composition/use-system-localization-use-cases',()=>({useSystemLocalizationUseCases:()=>({getSettings:mockSettings,getTexts:mockTexts,setText:mockSet})}));
beforeEach(()=>{mockOnline=true;jest.clearAllMocks();mockSettings.mockResolvedValue({revision:2,languages:['en','ar'],sources:[{id:'mobile:translation',client:'mobile',namespace:'translation'}],catalogVersions:{web:'w',mobile:'m'}});mockTexts.mockResolvedValue({revision:2,totalCount:1,items:[]});mockSet.mockResolvedValue(undefined);});
it('loads and saves global texts without company scope and invalidates the global runtime',async()=>{
 const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:Infinity},mutations:{retry:false,gcTime:Infinity}}});
 const wrapper=({children}:PropsWithChildren)=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
 const hook=await renderHook(()=>useCompanyLocalization(true),{wrapper});
 await waitFor(()=>expect(mockSettings).toHaveBeenCalledWith());await waitFor(()=>expect(mockTexts).toHaveBeenCalledWith(expect.objectContaining({source:'mobile:translation',page:1})));
 expect(hook.result.current.settings).not.toHaveProperty('companyId');
 const key=['system-ui-localizations','global',[...mockPermissions].sort().join('|'),'runtime',0];client.setQueryData(key,{revision:2,overrides:[]});
 await act(async()=>{await hook.result.current.setText.mutateAsync({source:'mobile:translation',language:'ar',key:'systemUiTexts.title',value:'نصوص النظام',expectedRevision:2});});
 expect(mockSet).toHaveBeenCalledWith({source:'mobile:translation',language:'ar',key:'systemUiTexts.title',value:'نصوص النظام',expectedRevision:2});expect(client.getQueryState(key)?.isInvalidated).toBe(true);
 await hook.unmount();client.clear();
});
it('does not query or mutate while offline',async()=>{
 mockOnline=false;const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:Infinity},mutations:{retry:false,gcTime:Infinity}}});const wrapper=({children}:PropsWithChildren)=><QueryClientProvider client={client}>{children}</QueryClientProvider>;
 const hook=await renderHook(()=>useCompanyLocalization(true),{wrapper});expect(mockSettings).not.toHaveBeenCalled();await act(async()=>{await expect(hook.result.current.setText.mutateAsync({source:'mobile:translation',language:'en',key:'systemUiTexts.title',value:'title',expectedRevision:0})).rejects.toThrow();});expect(mockSet).not.toHaveBeenCalled();await hook.unmount();client.clear();
});
