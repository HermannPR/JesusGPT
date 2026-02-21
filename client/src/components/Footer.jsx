import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="text-center py-8 mt-auto">
      <p className="text-sm font-sans text-parchment-500 italic">
        {t('footerDisclaimer')}
      </p>
    </footer>
  );
}
