import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'la', label: 'LA', name: 'Latina' },
  { code: 'gr', label: 'GR', name: 'Ελληνικά' },
];

export default function LanguageSwitcher({ compact }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex gap-1.5 ${compact ? '' : 'justify-center mt-4'}`}>
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
  );
}
