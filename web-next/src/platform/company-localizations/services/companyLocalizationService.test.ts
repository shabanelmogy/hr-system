import { describe,expect,it,vi,beforeEach } from "vitest";
const transport=vi.hoisted(()=>({get:vi.fn(),put:vi.fn(),post:vi.fn()}));
vi.mock("@/shared/services",()=>({apiService:transport}));
import {getCompanySettings,getCompanyRuntime,setCompanyText,resetCompanyText} from "./companyLocalizationService";
import {companyUiCatalogVersion} from "@/config/company-ui-catalog-version";
beforeEach(()=>vi.resetAllMocks());
describe("company localization transport",()=>{
  it("fails closed on foreign settings and runtime scope/version",async()=>{
    transport.get.mockResolvedValue({tenantId:"tenant",companyId:2,defaultLanguage:"en",revision:0,languages:["en","ar"],sources:[],catalogVersions:{}});
    await expect(getCompanySettings("tenant",1)).rejects.toThrow("scope mismatch");
    transport.get.mockResolvedValue({tenantId:"tenant",companyId:1,defaultLanguage:"en",revision:0,catalogVersion:"old",overrides:[]});
    await expect(getCompanyRuntime("tenant",1)).rejects.toThrow("scope mismatch");
    expect(transport.get).toHaveBeenLastCalledWith("/api/v1/company-localizations/runtime",{client:"web",catalogVersion:companyUiCatalogVersion});
  });
  it("sends exact text/reset requests preserving whitespace and revision",async()=>{
    const input={source:"web:core",language:"ar" as const,key:"general.name",value:" اسم ",expectedRevision:4};
    await setCompanyText(input);expect(transport.put).toHaveBeenCalledWith("/api/v1/company-localizations/text",input);
    const reset={source:input.source,language:input.language,key:input.key,expectedRevision:5};
    await resetCompanyText(reset);expect(transport.post).toHaveBeenCalledWith("/api/v1/company-localizations/reset",reset);
  });
});