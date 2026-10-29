import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReflection } from '../hooks/useReflection';

const MIN_H = 72;
const MIN_H_PHONE = 48; // one line of text plus padding
const MAX_H = 200;

const minHeight = () => (window.matchMedia('(max-width: 639px)').matches ? MIN_H_PHONE : MIN_H);

export default function QuestionInput({ onResponse, onAsk, onFail, history = [] }) {
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('direct');
  const { loading, error, fetchReflection } = useReflection();
  const textareaRef = useRef(null);

  const adjustHeight = useCallback((reset) => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${minHeight()}px`;
    if (!reset) el.style.height = `${Math.min(el.scrollHeight, MAX_H)}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight()}px`;
  }, []);

  const submit = async () => {
    const text = question.trim();
    if (!text || loading) return;
    setQuestion('');
    adjustHeight(true);
    onAsk?.(text);
    const data = await fetchReflection({ question: text, language, mode, history });
    if (data) {
      onResponse(text, data);
    } else {
      // Give the question back so the seeker can send it again
      setQuestion(text);
      requestAnimationFrame(() => adjustHeight(false));
      onFail?.();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="rounded-2xl border border-parchment-300 bg-white shadow-sm focus-within:border-parchment-500 focus-within:shadow-md transition-all overflow-hidden">
        {/* Textarea — no absolute children competing with it */}
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => { setQuestion(e.target.value); adjustHeight(); }}
          onKeyDown={handleKeyDown}
          placeholder={t('inputPlaceholder')}
          disabled={loading}
          rows={1}
          style={{ height: minHeight(), maxHeight: MAX_H }}
          className="w-full px-4 py-3 resize-none bg-transparent font-serif text-base text-gray-800
                     placeholder:text-parchment-500 focus:outline-none disabled:opacity-50 overflow-auto block"
        />

        {/* Divider + controls row — never overlaps textarea */}
        <div className="border-t border-parchment-100 flex items-center justify-between gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-parchment-50/50">
          {/* Mode pills */}
          <div className="flex gap-1 min-w-0">
            {[
              ['direct', t('modeDirectLabel'), t('modeDirectShort')],
              ['parable', t('modeParableLabel'), t('modeParableShort')],
            ].map(([m, label, short]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={loading}
                className={`px-3 py-3 sm:py-1 rounded-full text-xs font-sans font-semibold leading-4 whitespace-nowrap transition-colors
                  ${mode === m
                    ? 'bg-parchment-400 text-gray-900'
                    : 'text-parchment-500 hover:bg-parchment-100'
                  } disabled:opacity-40`}
              >
                {/* Narrow phones get the short label so both pills stay on one line */}
                <span className="min-[400px]:hidden">{short}</span>
                <span className="hidden min-[400px]:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={submit}
            disabled={loading || !question.trim()}
            aria-label={t('buttonText')}
            className={`shrink-0 w-10 h-10 sm:w-7 sm:h-7 rounded-lg transition-all flex items-center justify-center
              ${question.trim() && !loading
                ? 'bg-parchment-500 hover:bg-parchment-600 text-white'
                : 'bg-parchment-100 text-parchment-300 cursor-not-allowed'
              }`}
          >
            {loading
              ? <span className="w-4 h-4 block border-2 border-parchment-300 border-t-parchment-600 rounded-full animate-spin" />
              : <ArrowUpIcon className="w-4 h-4" />
            }
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-center text-red-600 font-sans text-sm">{t('errorMessage')}</p>}
      {/* Keyboard hint only makes sense with a physical keyboard */}
      <p className="hidden sm:block text-center text-parchment-300 font-sans text-xs">{t('enterHint')}</p>
    </div>
  );
}
