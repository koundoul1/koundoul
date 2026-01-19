import { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';
import api from '../services/api';

// Contexte i18n
const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Récupérer la langue depuis localStorage ou navigateur
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    // Détecter langue navigateur
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'fr' || browserLang === 'en' ? browserLang : 'fr';
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchroniser avec le backend si l'utilisateur est connecté
  useEffect(() => {
    const syncLanguageWithBackend = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          setIsLoading(true);
          // Récupérer les préférences utilisateur depuis le backend
          const userData = await api.users.getProfile();
          if (userData.data?.preferences?.language) {
            setLanguage(userData.data.preferences.language);
          }
        }
      } catch (error) {
        console.warn('Impossible de synchroniser la langue avec le backend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncLanguageWithBackend();
  }, []);

  useEffect(() => {
    // Sauvegarder dans localStorage
    localStorage.setItem('language', language);
    
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = language;
    
    // Synchroniser avec le backend si l'utilisateur est connecté
    const updateBackendLanguage = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.users.updateProfile({ 
            preferences: { language } 
          });
        }
      } catch (error) {
        console.warn('Impossible de mettre à jour la langue dans le backend:', error);
      }
    };

    updateBackendLanguage();
  }, [language]);

  const t = (key) => {
    // key format: "section.subsection.key" ex: "nav.home"
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (!value) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    return value;
  };

  const changeLanguage = (lang) => {
    if (lang === 'fr' || lang === 'en') {
      setLanguage(lang);
    }
  };

  const getAvailableLanguages = () => [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  return (
    <I18nContext.Provider value={{ 
      language, 
      changeLanguage, 
      t, 
      isLoading,
      getAvailableLanguages 
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

