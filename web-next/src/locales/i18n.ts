import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCore from "./resources/core/en.json";
import arCore from "./resources/core/ar.json";
import { registerCompanyUiBaseline } from "@/lib/localization/companyUiResources";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        core: enCore,
      },
      ar: {
        core: arCore,
      },
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "core",
    fallbackNS: "core",
    supportedLngs: ["en", "ar"],
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
  });

registerCompanyUiBaseline(i18n, "core", { en: enCore, ar: arCore });

export default i18n;
