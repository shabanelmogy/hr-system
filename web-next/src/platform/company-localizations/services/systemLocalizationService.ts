import { apiService } from "@/shared/services";
import { version } from "@/config/api/constants";
import { companyUiCatalogVersion } from "@/config/company-ui-catalog-version";
import { systemSettingsSchema, systemRuntimeSchema, companyTextsSchema } from "../validation/companyLocalizationValidation";
import type { TextQuery, TextWrite, TextReset } from "../types/companyLocalization";
const endpoint = version + "/system-ui-localizations";
export async function getSystemSettings() { return systemSettingsSchema.parse(await apiService.get<unknown>(endpoint + "/settings")); }
export async function getSystemTexts(query: TextQuery) { return companyTextsSchema.parse(await apiService.get<unknown>(endpoint + "/texts", query)); }
export async function setSystemText(request: TextWrite) { await apiService.put(endpoint + "/text", request); }
export async function resetSystemText(request: TextReset) { await apiService.post(endpoint + "/reset", request); }
export async function getSystemRuntime() {
 const value = systemRuntimeSchema.parse(await apiService.get<unknown>(endpoint + "/runtime", {client: "web", catalogVersion: companyUiCatalogVersion}));
 if(value.catalogVersion !== companyUiCatalogVersion) throw new Error("System UI catalog is incompatible.");
 return value;
}
