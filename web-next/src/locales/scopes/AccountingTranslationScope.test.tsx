import { afterAll, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { AccountingTranslationScope } from "./AccountingTranslationScope";

function Probe() {
  const { t } = useTranslation();
  return <span>{t("ledgerSetup.companySettings.title")}|{t("ledgerSetup.fields.functionalCurrencyId")}|{t("ledgerSetup.overview.open")}</span>;
}

describe("Accounting translation scope", () => {
  afterAll(async () => { await i18n.changeLanguage("en"); });

  it("resolves Ledger Setup keys in English and Arabic through the route scope", async () => {
    await i18n.changeLanguage("en");
    expect(renderToStaticMarkup(<AccountingTranslationScope><Probe /></AccountingTranslationScope>)).toContain("Company accounting settings");
    await i18n.changeLanguage("ar");
    const html = renderToStaticMarkup(<AccountingTranslationScope><Probe /></AccountingTranslationScope>);
    expect(html).toContain("إعدادات محاسبة الشركة");
    expect(html).not.toContain("ledgerSetup.");
  });
});
