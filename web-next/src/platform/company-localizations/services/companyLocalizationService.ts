import { apiService } from "@/shared/services";
import { version } from "@/config/api/constants";
import { companyUiCatalogVersion } from "@/config/company-ui-catalog-version";
import { companySettingsSchema,companyTextsSchema,companyRuntimeSchema } from "../validation/companyLocalizationValidation";
import type { Language,TextQuery,TextWrite,TextReset } from "../types/companyLocalization";
const endpoint=version+"/company-localizations";
export async function getCompanySettings(tenantId:string,companyId:number) {
  const value=companySettingsSchema.parse(await apiService.get<unknown>(endpoint+"/settings"));
  if(value.tenantId!==tenantId||value.companyId!==companyId) throw new Error("Company localization scope mismatch.");
  return value;
}
export async function getCompanyTexts(query:TextQuery) { return companyTextsSchema.parse(await apiService.get<unknown>(endpoint+"/texts",query)); }
export async function setCompanyDefault(request:{language:Language;expectedRevision:number}) { await apiService.put(endpoint+"/default",request); }
export async function setCompanyText(request:TextWrite) { await apiService.put(endpoint+"/text",request); }
export async function resetCompanyText(request:TextReset) { await apiService.post(endpoint+"/reset",request); }
export async function getCompanyRuntime(tenantId:string,companyId:number) {
  const value=companyRuntimeSchema.parse(await apiService.get<unknown>(endpoint+"/runtime",{client:"web",catalogVersion:companyUiCatalogVersion}));
  if(value.tenantId!==tenantId||value.companyId!==companyId||value.catalogVersion!==companyUiCatalogVersion) throw new Error("Company localization runtime scope mismatch.");
  return value;
}