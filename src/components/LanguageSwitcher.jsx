import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';

export default function LanguageSwitcher({ dark = false }) {
  const { language, changeLanguage, getAvailableLanguages, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = getAvailableLanguages();
  const currentLang = languages.find(lang => lang.code === language);

  // Styles selon le thème (clair ou sombre)
  const buttonStyles = dark
    ? "flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-gray-800/95 backdrop-blur-xl border-2 border-gray-600 rounded-lg font-semibold text-white hover:border-purple-500 hover:bg-gray-700 transition-colors disabled:opacity-50 shadow-lg"
    : "flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-koundoul-button-primary transition-colors disabled:opacity-50";

  const dropdownStyles = dark
    ? "absolute top-full left-0 mt-2 w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-600 rounded-lg shadow-2xl z-[10000]"
    : "absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[10000]";

  const itemStyles = (lang) => {
    if (dark) {
      return lang.code === language
        ? "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors bg-gray-600 text-white"
        : "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-600 transition-colors text-gray-200";
    } else {
      return lang.code === language
        ? "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors bg-koundoul-button-primary/10 text-koundoul-button-primary"
        : "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700";
    }
  };

  const checkmarkStyles = dark ? "ml-auto text-white" : "ml-auto text-koundoul-button-primary";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={buttonStyles}
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span className="text-xs sm:text-sm whitespace-nowrap">{currentLang?.flag} {currentLang?.name}</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={dropdownStyles}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={itemStyles(lang)}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {lang.code === language && (
                <span className={checkmarkStyles}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

