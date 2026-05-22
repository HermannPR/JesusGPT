import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReflection } from '../hooks/useReflection';

const MIN_H = 72;
const MAX_H = 200;

export default function QuestionInput({ onResponse, onAsk, history = [] }) {
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('direct');
  const { loading, error, fetchReflection } = useReflection();
  const textareaRef = useRef(null);

  const adjustHeight = useCallback((reset) => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = `${MIN_H}px`;
    if (!reset) el.style.height = `${Math.min(el.scrollHeight, MAX_H)}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${MIN_H}px`;
  }, []);

  const submit = async () => {
    const text = question.trim();
    if (!text || loading) return;
    setQuestion('');
    adjustHeight(true);
    onAsk?.();
    const data = await fetchReflection({ question: text, language, mode, history });
    if (data) onResponse(text, data);
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
          style={{ height: MIN_H, maxHeight: MAX_H }}
          className="w-full px-4 py-3 resize-none bg-transparent font-serif text-base text-gray-800
                     placeholder:text-parchment-300 focus:outline-none disabled:opacity-50 overflow-auto block"
        />

        {/* Divider + controls row — never overlaps textarea */}
        <div className="border-t border-parchment-100 flex items-center justify-between px-3 py-2 bg-parchment-50/50">
          {/* Mode pills */}
          <div className="flex gap-1">
            {[['direct', t('modeDirectLabel')], ['parable', t('modeParableLabel')]].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                disabled={loading}
                className={`px-3 py-1 rounded-full text-xs font-sans font-semibold transition-colors
                  ${mode === m
                    ? 'bg-parchment-400 text-gray-900'
                    : 'text-parchment-500 hover:bg-parchment-100'
                  } disabled:opacity-40`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={submit}
            disabled={loading || !question.trim()}
            className={`p-1.5 rounded-lg transition-all flex items-center justify-center
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

      {error && <p className="text-center text-red-500 font-sans text-xs">{t('errorMessage')}</p>}
      <p className="text-center text-parchment-300 font-sans text-xs">Enter to send · Shift+Enter for new line</p>
    </div>
  );
}
