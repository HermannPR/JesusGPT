import { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuestionInput from './components/QuestionInput';
import ResponseDisplay from './components/ResponseDisplay';

function App() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const handleResponse = (question, data) => {
    setMessages(prev => [...prev, { question, response: data.response, verses: data.verses }]);
    setHistory(prev => [
      ...prev,
      { role: 'user', content: question },
      { role: 'assistant', content: data.response },
    ]);
    setLoading(false);
  };

  const handleAsk = () => setLoading(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-stone-50">
      {/* Compact sticky header */}
      <div className="shrink-0 border-b border-parchment-200 bg-white/90 backdrop-blur px-4 py-3 flex items-center justify-between">
        <Header compact />
        <LanguageSwitcher compact />
      </div>

      {/* Scrollable messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-8">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center mt-24 gap-3 opacity-50">
              <p className="font-serif text-2xl text-parchment-500">Ask anything.</p>
              <p className="font-serif text-parchment-400 italic">He is listening.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col gap-4">
              {/* User bubble — right aligned */}
              <div className="flex justify-end">
                <div className="bg-parchment-100 border border-parchment-300 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                  <p className="font-serif text-gray-800 text-base leading-relaxed">{msg.question}</p>
                </div>
              </div>
              {/* Response — full width, no bubble */}
              <ResponseDisplay response={msg.response} verses={msg.verses} />
            </div>
          ))}

          {/* Typing indicator while waiting */}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 px-4 py-3">
                <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-parchment-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned input bar */}
      <div className="shrink-0 border-t border-parchment-200 bg-white/90 backdrop-blur px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <QuestionInput onResponse={handleResponse} onAsk={handleAsk} history={history} />
        </div>
      </div>
    </div>
  );
}

export default App;
