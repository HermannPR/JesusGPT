import { ChevronDownIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'la', label: 'LA', name: 'Latina' },
  { code: 'gr', label: 'GR', name: 'Ελληνικά' },
];

export default function LanguageSwitcher({ compact }) {
  const { language, setLanguage, t } = useLanguage();
  const current = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  return (
    <>
      {/* Phones: one native picker, so the title keeps its room */}
      {compact && (
        <label className="sm:hidden relative shrink-0 flex items-center gap-1 h-10 pl-3 pr-2 rounded-md
                          bg-parchment-100 font-sans text-sm font-semibold text-gray-700">
          {current.label}
          <ChevronDownIcon className="w-4 h-4 text-parchment-500" aria-hidden="true" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label={t('languageLabel')}
            className="absolute inset-0 w-full h-full opacity-0 text-base cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </label>
      )}

      <div className={`gap-1.5 ${compact ? 'hidden sm:flex shrink-0' : 'flex justify-center mt-4'}`}>
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            title={lang.name}
            className={`
              px-2.5 py-1 rounded-md font-sans text-xs font-semibold transition-all duration-200
              ${language === lang.code
                ? 'bg-parchment-400 text-gray-900 shadow-sm'
                : 'bg-parchment-100 text-gray-500 hover:bg-parchment-200'
              }
            `}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </>
  );
}
