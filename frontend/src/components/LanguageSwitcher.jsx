import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation.jsx';

export default function LanguageSwitcher() {
  const { language, changeLanguage, getAvailableLanguages, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = getAvailableLanguages();
  const currentLang = languages.find(lang => lang.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-koundoul-button-primary transition-colors disabled:opacity-50"
      >
        <Globe className="w-5 h-5" />
        <span>{currentLang?.flag} {currentLang?.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                lang.code === language ? 'bg-koundoul-button-primary/10 text-koundoul-button-primary' : 'text-gray-700'
              }`}
            >
              <span className="text-xl">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {lang.code === language && (
                <span className="ml-auto text-koundoul-button-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

