import { getSystemSettings, getSystemTexts, setSystemText, resetSystemText, getSystemRuntime } from "../services/systemLocalizationService";
import { useMutation,useQuery,useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/SessionContext";
import { getCompanySettings,getCompanyTexts,getCompanyRuntime,setCompanyDefault,setCompanyText,resetCompanyText } from "../services/companyLocalizationService";
import type { CompanySettings,SystemSettings,Language,TextQuery,TextWrite,TextReset } from "../types/companyLocalization";
import { companyUiGeneration } from "@/lib/localization/companyUiResources";
export function resolveAvailableCompanyUiSource(requested:string,sources:CompanySettings["sources"]|undefined,client:"web"|"mobile"):string {
  if (!sources) return "";
  if (requested && sources.some(source=>source.id===requested)) return requested;
  return sources.find(source=>source.client===client)?.id||sources[0]?.id||"";
}
export function useCompanyLocalization(query:TextQuery,enabled:boolean,system=false) {
  const {user}=useSession();const cache=useQueryClient();
  const scope=system?["system-ui-localizations",user?.userId,[...(user?.permissions??[])].sort().join("|")] as const:["company-localizations",user?.tenantId,user?.companyId,user?.userId] as const;
  const settings=useQuery<CompanySettings|SystemSettings>({queryKey:[...scope,"settings"],queryFn:()=>system?getSystemSettings():getCompanySettings(user!.tenantId,user!.companyId),enabled:enabled&&(system||Boolean(user?.companyId))});
  const effectiveQuery={...query,source:resolveAvailableCompanyUiSource(query.source,settings.data?.sources,"web")};
  const texts=useQuery({queryKey:[...scope,"texts",effectiveQuery],queryFn:()=>system?getSystemTexts(effectiveQuery):getCompanyTexts(effectiveQuery),enabled:enabled&&settings.isSuccess&&(system||Boolean(user?.companyId))&&Boolean(effectiveQuery.source)});
  const refresh=()=>cache.invalidateQueries({queryKey:system?["system-ui-localizations"]:scope});
  const defaultMutation=useMutation({mutationFn:(request:{language:Language;expectedRevision:number})=>setCompanyDefault(request),onSuccess:refresh});
  const textMutation=useMutation({mutationFn:(request:TextWrite)=>system?setSystemText(request):setCompanyText(request),onSuccess:refresh});
  const resetMutation=useMutation({mutationFn:(request:TextReset)=>system?resetSystemText(request):resetCompanyText(request),onSuccess:refresh});
  return {settings,texts,defaultMutation,textMutation,resetMutation};
}
export function useCompanyLocalizationRuntime() {
  const {user,isSwitchingCompany,isLoggingOut}=useSession();
  return useQuery({queryKey:["company-localizations",user?.tenantId,user?.companyId,user?.userId,"runtime"],
    queryFn:async()=>{
      const generation=companyUiGeneration();
      const result=await getCompanyRuntime(user!.tenantId,user!.companyId);
      if(generation!==companyUiGeneration()) throw new Error("Company localization scope changed.");
      return result;
    },
    enabled:Boolean(user?.companyId&&user.tenantId)&&!isSwitchingCompany&&!isLoggingOut&&!user?.roles.includes("super_admin"),
    staleTime:30000,refetchInterval:60000,retry:1});
}

export function useSystemLocalizationRuntime() {
 const {user,isSwitchingCompany,isLoggingOut}=useSession();
 const signature=[...(user?.permissions??[])].sort().join("|");
 const enabled=Boolean(user?.roles.includes("super_admin"))&&!isSwitchingCompany&&!isLoggingOut;
 const query=useQuery({queryKey:["system-ui-localizations",user?.userId,signature,"runtime"],enabled,
 queryFn:async()=>{const generation=companyUiGeneration();const bundle=await getSystemRuntime();if(generation!==companyUiGeneration())throw new Error("System localization actor changed.");return bundle;},staleTime:30000,refetchInterval:60000,retry:1});
 return {query,enabled,signature,permissions:user?.permissions??[]};
}
