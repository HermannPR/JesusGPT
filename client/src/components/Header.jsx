import { useLanguage } from '../context/LanguageContext';

export default function Header({ compact }) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <h1 className="font-serif text-xl text-red-letter tracking-wide">
        {t('appTitle')}
      </h1>
    );
  }

  return (
    <header className="text-center pt-10 pb-4">
      <h1 className="text-4xl md:text-5xl font-serif text-red-letter tracking-wide">
        {t('appTitle')}
      </h1>
      <p className="mt-3 text-lg text-parchment-500 font-sans italic">
        {t('subtitle')}
      </p>
    </header>
  );
}
