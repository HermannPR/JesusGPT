import { useLanguage } from '../context/LanguageContext';

export default function LoadingSpinner() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="w-5 h-5 border-2 border-parchment-500 border-t-transparent rounded-full animate-spin" />
      <span className="font-sans">{t('loading')}</span>
    </div>
  );
}
