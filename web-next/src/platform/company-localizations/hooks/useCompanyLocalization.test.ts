import { describe, expect, it } from "vitest";
import { resolveAvailableCompanyUiSource } from "./useCompanyLocalization";

describe("company localization source resolution", () => {
  const sources=[{id:"web:core",client:"web" as const,namespace:"core"},{id:"mobile:translation",client:"mobile" as const,namespace:"translation"}];
  it("keeps a returned selection but safely falls back when settings remove it",()=>{
    expect(resolveAvailableCompanyUiSource("mobile:translation",sources,"web")).toBe("mobile:translation");
    expect(resolveAvailableCompanyUiSource("removed:source",sources,"web")).toBe("web:core");
    expect(resolveAvailableCompanyUiSource("removed:source",[],"web")).toBe("");
    expect(resolveAvailableCompanyUiSource("stale:source",undefined,"web")).toBe("");
  });
});
