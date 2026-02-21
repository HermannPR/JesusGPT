import { useState } from 'react';
import Header from './components/Header';
import LanguageSwitcher from './components/LanguageSwitcher';
import QuestionInput from './components/QuestionInput';
import ResponseDisplay from './components/ResponseDisplay';
import SelahButton from './components/SelahButton';

function App() {
  const [response, setResponse] = useState(null);
  const [canAskNext, setCanAskNext] = useState(true);
  const [showSelah, setShowSelah] = useState(false);

  const handleResponse = (data) => {
    setResponse(data);
    setCanAskNext(false);
    setShowSelah(true);
  };

  const handleSelah = () => {
    setShowSelah(false);
    setCanAskNext(true);
  };

  return (
    <div className="min-h-screen flex flex-col px-4">
      <Header />
      <LanguageSwitcher />

      <main className="flex-1 max-w-2xl mx-auto w-full space-y-8 mt-8 mb-8">
        <QuestionInput onResponse={handleResponse} disabled={!canAskNext} />

        {response && (
          <ResponseDisplay
            response={response.response}
            verses={response.verses}
          />
        )}

        {showSelah && <SelahButton onClick={handleSelah} />}
      </main>
    </div>
  );
}

export default App;
