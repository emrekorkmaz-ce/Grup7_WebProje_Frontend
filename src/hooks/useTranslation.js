import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import trTranslations from '../locales/tr.json';
import enTranslations from '../locales/en.json';

const translations = {
  tr: trTranslations,
  en: enTranslations
};

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Replace parameters in translation string
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return value;
  };

  return { t, language };
};









