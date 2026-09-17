import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCore from "./resources/core/en.json";
import arCore from "./resources/core/ar.json";

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
    initImmediate: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
