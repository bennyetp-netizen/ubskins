import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import mn from "./mn.json";
import en from "./en.json";

const STORAGE_KEY = "lang";
const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const initial = stored === "en" || stored === "mn" ? stored : "mn";

i18n.use(initReactI18next).init({
  resources: {
    mn: { translation: mn },
    en: { translation: en },
  },
  lng: initial,
  fallbackLng: "mn",
  interpolation: { escapeValue: false },
  returnNull: false,
});

if (typeof document !== "undefined") {
  document.documentElement.lang = initial;
}

i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  }
});

export default i18n;
