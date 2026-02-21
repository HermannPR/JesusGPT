import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useReflection } from '../hooks/useReflection';
import LoadingSpinner from './LoadingSpinner';

export default function QuestionInput({ onResponse, disabled }) {
  const { t, language } = useLanguage();
  const [question, setQuestion] = useState('');
  const [mode, setMode] = useState('direct');
  const { loading, error, fetchReflection } = useReflection();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || disabled || loading) return;

    const data = await fetchReflection({ question, language, mode });
    if (data) {
      onResponse(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode Toggle */}
      <div className="flex gap-6 justify-center">
        <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-gray-700">
          <input
            type="radio"
            name="mode"
            value="direct"
            checked={mode === 'direct'}
            onChange={(e) => setMode(e.target.value)}
            className="w-4 h-4 accent-parchment-500"
          />
          {t('modeDirectLabel')}
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-sans text-sm text-gray-700">
          <input
            type="radio"
            name="mode"
            value="parable"
            checked={mode === 'parable'}
            onChange={(e) => setMode(e.target.value)}
            className="w-4 h-4 accent-parchment-500"
          />
          {t('modeParableLabel')}
        </label>
      </div>

      {/* Text Input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={t('inputPlaceholder')}
        disabled={disabled || loading}
        rows={4}
        className="w-full p-4 rounded-lg bg-white/80 border-2 border-parchment-300
                   focus:border-parchment-500 focus:outline-none resize-none
                   font-serif text-lg placeholder:text-parchment-400
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || loading || !question.trim()}
        className="w-full py-3 bg-parchment-400 hover:bg-parchment-500
                   text-gray-900 font-serif text-xl rounded-lg
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {loading ? <LoadingSpinner /> : t('buttonText')}
      </button>

      {/* Error Display */}
      {error && (
        <p className="text-center text-red-letter font-sans text-sm">
          {t('errorMessage')}
        </p>
      )}
    </form>
  );
}
