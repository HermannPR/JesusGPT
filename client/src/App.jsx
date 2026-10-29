import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuestionInput from './components/QuestionInput';
import ResponseDisplay from './components/ResponseDisplay';
import { useLanguage } from './context/LanguageContext';

function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-parchment-100 border border-parchment-300 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] sm:max-w-[80%]">
        <p className="font-serif text-gray-800 text-base leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function App() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const scrollRef = useRef(null);
  const lastRef = useRef(null);

  const handleResponse = (question, data) => {
    setMessages(prev => [...prev, { question, response: data.response, verses: data.verses }]);
    setHistory(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: data.response },
    ]);
    setPending(null);
    setLoading(false);
  };

  // Show the question right away so it stays on screen while the answer loads
  const handleAsk = (text) => {
    setPending(text);
    setLoading(true);
  };
  const handleFail = () => {
    setPending(null);
    setLoading(false);
  };

  // While waiting, keep the question and the typing dots in view
  useEffect(() => {
    const sc = scrollRef.current;
    if (loading && sc) sc.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' });
  }, [loading]);

  // When an answer arrives, start reading from its question, not from its last line
  useEffect(() => {
    const sc = scrollRef.current;
    const last = lastRef.current;
    if (!sc || !last) return;
    const top = sc.scrollTop + last.getBoundingClientRect().top - sc.getBoundingClientRect().top - 16;
    sc.scrollTo({ top, behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-stone-50">
      {/* Compact sticky header */}
      <div className="shrink-0 border-b border-parchment-200 bg-white/90 backdrop-blur px-4 py-2.5 sm:py-3
                      pt-[max(0.625rem,env(safe-area-inset-top))] flex items-center justify-between gap-3">
        <Header compact />
        <LanguageSwitcher compact />
      </div>

      {/* Scrollable messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center mt-16 sm:mt-24 gap-3 text-center">
              <p className="font-serif text-2xl text-parchment-600">{t('emptyTitle')}</p>
              <p className="font-serif text-parchment-700 italic">{t('emptySubtitle')}</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} ref={i === messages.length - 1 ? lastRef : null} className="flex flex-col gap-4">
              {/* User bubble — right aligned */}
              <UserBubble text={msg.question} />
              {/* Response — full width, no bubble */}
              <ResponseDisplay response={msg.response} verses={msg.verses} />
            </div>
          ))}

          {/* Question being answered, then typing indicator */}
          {loading && (
            <div className="flex flex-col gap-4">
              {pending && <UserBubble text={pending} />}
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned input bar */}
      <div className="shrink-0 border-t border-parchment-200 bg-white/90 backdrop-blur px-4 pt-3 sm:pt-4
                      pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-4">
        <div className="max-w-2xl mx-auto">
          <QuestionInput onResponse={handleResponse} onAsk={handleAsk} onFail={handleFail} history={history} />
        </div>
      </div>
    </div>
  );
}

export default App;
