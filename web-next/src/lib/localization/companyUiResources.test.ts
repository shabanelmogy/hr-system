import { beforeEach, describe, expect, it } from "vitest";
import { createInstance } from "i18next";
import { applySystemUiResources, clearSystemUiResources, applyCompanyUiResources, clearCompanyUiResources, companyUiGeneration, explicitUiLanguage, registerCompanyUiBaseline } from "./companyUiResources";

beforeEach(()=>clearCompanyUiResources());
describe("company UI resource isolation",()=>{
  it("applies only existing leaf keys and restores the original bundle on scope reset",async()=>{
    const instance=createInstance();await instance.init({lng:"en",fallbackLng:"en",initAsync:false});
    registerCompanyUiBaseline(instance,"core",{en:{home:"Home",nested:{label:"Name"}},ar:{home:"الرئيسية",nested:{label:"الاسم"}}});
    expect(applyCompanyUiResources([
      {namespace:"core",language:"en",key:"home",value:"Company home"},
      {namespace:"core",language:"en",key:"unknown",value:"Injected"},
      {namespace:"core",language:"en",key:"nested.__proto__.value",value:"Unsafe"},
    ],"en",companyUiGeneration())).toBe(true);
    expect(instance.t("home",{ns:"core"})).toBe("Company home");
    expect(instance.exists("unknown",{ns:"core"})).toBe(false);
    clearCompanyUiResources();
    expect(instance.t("home",{ns:"core"})).toBe("Home");
  });
  it("reapplies overlays when a lazy namespace arrives and rejects stale generation",async()=>{
    const instance=createInstance();await instance.init({lng:"en",initAsync:false});
    const old=companyUiGeneration();
    applyCompanyUiResources([{namespace:"module-hr",language:"en",key:"jobs.title",value:"Company jobs"}],"en",old);
    registerCompanyUiBaseline(instance,"module-hr",{en:{jobs:{title:"Jobs"}},ar:{jobs:{title:"وظائف"}}});
    expect(instance.t("jobs.title",{ns:"module-hr"})).toBe("Company jobs");
    clearCompanyUiResources();
    expect(applyCompanyUiResources([{namespace:"module-hr",language:"en",key:"jobs.title",value:"Late"}],"en",old)).toBe(false);
    expect(instance.t("jobs.title",{ns:"module-hr"})).toBe("Jobs");
  });
  it("excludes system-owned namespaces and prefixes while retaining company and shared strings",async()=>{
    const instance=createInstance();await instance.init({lng:"en",fallbackLng:"en",initAsync:false});
    registerCompanyUiBaseline(instance,"core",{en:{menu:{countries:"Countries",superAdminDashboard:"Super Admin"},actions:{save:"Save"},userPermissions:{title:"Permissions"}},ar:{menu:{countries:"البلدان",superAdminDashboard:"مدير النظام"},actions:{save:"حفظ"},userPermissions:{title:"الأذونات"}}});
    registerCompanyUiBaseline(instance,"reference-address-types",{en:{title:"Address types"},ar:{title:"أنواع العناوين"}});
    const generation=companyUiGeneration();
    applyCompanyUiResources([
      {namespace:"core",language:"en",key:"menu.countries",value:"Changed countries"},
      {namespace:"core",language:"en",key:"menu.superAdminDashboard",value:"Changed admin"},
      {namespace:"core",language:"en",key:"actions.save",value:"Company save"},
      {namespace:"core",language:"en",key:"userPermissions.title",value:"Company permissions"},
      {namespace:"reference-address-types",language:"en",key:"title",value:"Company address types"},
      {namespace:"reference-countries",language:"en",key:"title",value:"Changed system countries"},
    ],"en",generation);
    registerCompanyUiBaseline(instance,"reference-countries",{en:{title:"Countries"},ar:{title:"البلدان"}});
    expect(instance.t("menu.countries",{ns:"core"})).toBe("Countries");
    expect(instance.t("menu.superAdminDashboard",{ns:"core"})).toBe("Super Admin");
    expect(instance.t("actions.save",{ns:"core"})).toBe("Company save");
    expect(instance.t("userPermissions.title",{ns:"core"})).toBe("Company permissions");
    expect(instance.t("title",{ns:"reference-address-types"})).toBe("Company address types");
    expect(instance.t("title",{ns:"reference-countries"})).toBe("Countries");
  });
  it("distinguishes explicit user preference from an absent language",()=>{
    expect(explicitUiLanguage("theme=dark")).toBeNull();
    expect(explicitUiLanguage("i18next=en; theme=dark")).toBe("en");
    expect(explicitUiLanguage("other=x; i18next=ar")).toBe("ar");
  });
});

describe("global UI runtime authority",()=>{
 it("applies lazy global namespaces only for owned screens and clears across auth generations",async()=>{
  const instance=createInstance();await instance.init({lng:"en",fallbackLng:"en",initAsync:false});
  registerCompanyUiBaseline(instance,"core",{en:{menu:{countries:"Countries",users:"Users"},actions:{save:"Save"}},ar:{menu:{countries:"دول",users:"مستخدمون"},actions:{save:"حفظ"}}});
  const entries=[{namespace:"core",language:"en" as const,key:"menu.countries",value:"Nations"},{namespace:"core",language:"en" as const,key:"menu.users",value:"Private"},{namespace:"reference-countries",language:"en" as const,key:"title",value:"Global nations"}];
  const generation=companyUiGeneration();applySystemUiResources(entries,[],generation);
  expect(instance.t("menu.countries",{ns:"core"})).toBe("Countries");
  applySystemUiResources(entries,["Countries:View"],generation);
  expect(instance.t("menu.countries",{ns:"core"})).toBe("Nations");expect(instance.t("menu.users",{ns:"core"})).toBe("Users");
  registerCompanyUiBaseline(instance,"reference-countries",{en:{title:"Countries"},ar:{title:"الدول"}});
  expect(instance.t("title",{ns:"reference-countries"})).toBe("Global nations");
  clearSystemUiResources();expect(instance.t("menu.countries",{ns:"core"})).toBe("Countries");
  clearCompanyUiResources();expect(applySystemUiResources(entries,["Countries:View"],generation)).toBe(false);
 });
});
