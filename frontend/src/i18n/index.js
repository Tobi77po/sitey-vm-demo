import React, { createContext, useContext, useState, useCallback } from "react";
import tr from "./tr";
import en from "./en";

const languages = { tr, en };

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("siteyvm_lang") || "tr";
  });

  const switchLang = useCallback((newLang) => {
    if (languages[newLang]) {
      setLang(newLang);
      localStorage.setItem("siteyvm_lang", newLang);
    }
  }, []);

  const t = languages[lang] || languages.tr;

  return (
    <I18nContext.Provider value={{ t, lang, switchLang, languages: Object.keys(languages) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { languages };
