import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ko, en } from './locales/resources';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: ko },
      en: { translation: en }
    },
    lng: 'ko', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;