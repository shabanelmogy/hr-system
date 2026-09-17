import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useTranslation } from "react-i18next";
import enCore from "./resources/core/en.json";
import i18n from "./i18n";
import {
  registerStaticNamespace,
  StaticTranslationScope,
} from "./StaticTranslationScope";

const namespace = "test-static-scope";

function TranslationProbe() {
  const { t } = useTranslation();
  return <div>{t("feature.title")}|{t("common.loading")}</div>;
}

describe("StaticTranslationScope", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
    i18n.removeResourceBundle("en", namespace);
    i18n.removeResourceBundle("ar", namespace);
    registerStaticNamespace(namespace, {
      en: { feature: { title: "Feature" } },
      ar: { feature: { title: "الميزة" } },
    });
  });

  afterAll(async () => {
    i18n.removeResourceBundle("en", namespace);
    i18n.removeResourceBundle("ar", namespace);
    await i18n.changeLanguage("en");
  });

  it("uses the route namespace and falls back to the eager core namespace", () => {
    const html = renderToStaticMarkup(
      <StaticTranslationScope namespace={namespace}>
        <TranslationProbe />
      </StaticTranslationScope>,
    );

    expect(html).toContain("Feature");
    expect(html).toContain(enCore.common.loading);
  });

  it("switches language without loading another namespace after render", async () => {
    await i18n.changeLanguage("ar");

    const html = renderToStaticMarkup(
      <StaticTranslationScope namespace={namespace}>
        <TranslationProbe />
      </StaticTranslationScope>,
    );

    expect(html).toContain("الميزة");
    expect(html).not.toContain("common.loading");
  });

  it("keeps large feature catalogs out of the eager core resource", () => {
    expect(enCore).not.toHaveProperty("recruitment");
    expect(enCore).not.toHaveProperty("countries");
    expect(enCore).not.toHaveProperty("organizationalStructure.empty");
  });
});
