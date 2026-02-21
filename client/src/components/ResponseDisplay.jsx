import { useLanguage } from '../context/LanguageContext';
import { parseRedLetter } from '../utils/redLetterParser';
import { useSpeech } from '../hooks/useSpeech';
import AnimatedScene from './AnimatedScene';

export default function ResponseDisplay({ response, verses }) {
  const { t, language } = useLanguage();
  const { speak, stop, speaking } = useSpeech();
  const formattedResponse = parseRedLetter(response);

  const handleListen = () => {
    if (speaking) {
      stop();
    } else {
      speak(response, language);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in opacity-0">
      {/* Animated Scene (shows when image exists) */}
      <AnimatedScene text={response} speaking={speaking} />

      <div className="bg-white/70 rounded-xl p-6 md:p-8 shadow-md border border-parchment-300">
        {/* Listen Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleListen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm
                       bg-parchment-200 hover:bg-parchment-300 text-gray-700
                       transition-all duration-200"
          >
            {speaking ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                {t('stopListening')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
                {t('listen')}
              </>
            )}
          </button>
        </div>

        {/* AI Response with Red Letter formatting */}
        <div
          className="font-serif text-lg leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: formattedResponse }}
        />

        {/* Related Verses */}
        {verses && verses.length > 0 && (
          <div className="mt-6 pt-6 border-t border-parchment-300">
            <h3 className="text-xs font-sans font-semibold uppercase tracking-wider text-parchment-500 mb-3">
              {t('relatedVerses')}
            </h3>
            <ul className="space-y-2">
              {verses.map((v, i) => (
                <li key={i} className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800">{v.reference}</span>
                  {' — '}
                  {v.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
