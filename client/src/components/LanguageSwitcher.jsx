import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'la', label: 'LA', name: 'Latina' },
  { code: 'gr', label: 'GR', name: 'Ελληνικά' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex justify-center gap-2 mt-4">
      {LANGUAGES.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          title={lang.name}
          className={`
            px-4 py-2 rounded-md font-sans text-sm transition-all duration-200
            ${language === lang.code
              ? 'bg-parchment-400 text-gray-900 font-bold shadow-sm'
              : 'bg-parchment-200 text-gray-600 hover:bg-parchment-300'
            }
          `}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
