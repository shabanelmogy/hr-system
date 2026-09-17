import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { PlatformTenantsTranslationScope } from "./PlatformTenantsTranslationScope";

function DashboardTranslationProbe() {
  const { t } = useTranslation();
  return (
    <div>
      {t("superAdminDashboard.title")}|{t("tenantManagement.admins")}|{t("menu.globalGeography")}
    </div>
  );
}

describe("PlatformTenantsTranslationScope", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("ar");
  });

  afterAll(async () => {
    await i18n.changeLanguage("en");
  });

  it("resolves Super Admin dashboard Arabic keys and shared core fallbacks", () => {
    const html = renderToStaticMarkup(
      <PlatformTenantsTranslationScope>
        <DashboardTranslationProbe />
      </PlatformTenantsTranslationScope>,
    );

    expect(html).toContain("لوحة تحكم مدير النظام");
    expect(html).toContain("المديرون");
    expect(html).toContain("البيانات الجغرافية العالمية");
    expect(html).not.toContain("superAdminDashboard.title");
  });
});
