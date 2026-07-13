import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./en/translation.json";
import arTranslation from "./ar/translation.json";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ar: {
        translation: arTranslation,
      },
    },
    fallbackLng: "en",
    detection: {
      order: ["cookie", "htmlTag", "localStorage", "navigator"],
      caches: ["cookie"],
    },
  });

i18n.on("languageChanged", (lng) => {
  console.log("Language changed to:", lng);
});

export default i18n;
