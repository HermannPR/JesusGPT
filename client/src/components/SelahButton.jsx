import { useLanguage } from '../context/LanguageContext';

export default function SelahButton({ onClick }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-2 animate-fade-in opacity-0">
      <button
        onClick={onClick}
        className="px-10 py-4 bg-parchment-400/80 hover:bg-parchment-500
                   text-gray-900 font-serif text-2xl italic rounded-xl
                   transition-all duration-300 shadow-lg hover:shadow-xl
                   border border-parchment-300"
      >
        {t('selahText')}
      </button>
      <span className="text-xs font-sans text-parchment-500 italic">
        {t('selahSubtext')}
      </span>
    </div>
  );
}
