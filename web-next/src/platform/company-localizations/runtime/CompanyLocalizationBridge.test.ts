import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInstance } from "i18next";
import {
  clearCompanyUiResources,
  registerCompanyUiBaseline,
} from "@/lib/localization/companyUiResources";
import { reconcileCompanyLocalizationRuntime } from "./CompanyLocalizationBridge";

const companyA = {
  tenantId: "tenant-a",
  companyId: 1,
  defaultLanguage: "ar" as const,
  overrides: [{ namespace: "core", language: "ar" as const, key: "title", value: "A title" }],
};

beforeEach(() => clearCompanyUiResources());
afterEach(() => vi.unstubAllGlobals());

describe("company localization runtime bridge", () => {
  it("keeps a late bundle for company A from overlaying company B", async () => {
    const instance = createInstance();
    await instance.init({ lng: "en", fallbackLng: "en", initAsync: false });
    registerCompanyUiBaseline(instance, "core", {
      en: { title: "Title" },
      ar: { title: "العنوان" },
    });

    // The selected session moved before A's pending runtime request settled.
    reconcileCompanyLocalizationRuntime(companyA, false, { tenantId: "tenant-a", companyId: 2 });

    expect(instance.t("title", { ns: "core", lng: "ar" })).toBe("العنوان");
    expect(instance.language).toBe("en");
  });

  it("applies an Arabic default through the shared language event and restores the baseline after an error", async () => {
    vi.stubGlobal("document", { cookie: "" });
    const instance = createInstance();
    await instance.init({ lng: "en", fallbackLng: "en", initAsync: false });
    registerCompanyUiBaseline(instance, "core", {
      en: { title: "Title" },
      ar: { title: "العنوان" },
    });
    let changedTo = "";
    instance.on("languageChanged", (language) => { changedTo = language; });

    reconcileCompanyLocalizationRuntime(companyA, false, { tenantId: "tenant-a", companyId: 1 });
    await Promise.resolve();
    expect(changedTo).toBe("ar");
    expect(instance.language).toBe("ar");
    expect(instance.t("title", { ns: "core" })).toBe("A title");

    reconcileCompanyLocalizationRuntime(undefined, true, { tenantId: "tenant-a", companyId: 1 });
    expect(instance.language).toBe("en");
    expect(instance.t("title", { ns: "core" })).toBe("Title");
  });
});
