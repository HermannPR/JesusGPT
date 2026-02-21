import { useState, useRef, useCallback } from 'react';

const LANG_MAP = {
  en: 'en',
  es: 'es',
  la: 'it',   // Latin — Italian is the closest available
  gr: 'el',   // Greek
};

// Priority name patterns for picking a good male voice per language
const MALE_PATTERNS = {
  en: /daniel|james|arthur|oliver|aaron|fred|alex|bruce|ralph|tom/i,
  es: /jorge|enrique|carlos|miguel|diego|damián|andrés|antonio/i,
  it: /luca|matteo|alice/i,
  el: /nikos|stefanos/i,
};

function stripMarkdown(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\n+/g, '. ')
    .trim();
}

function pickVoice(langCode) {
  const voices = window.speechSynthesis.getVoices();
  const pattern = MALE_PATTERNS[langCode];

  // 1. Male voice matching name pattern for this language
  const named = voices.find(v => v.lang.startsWith(langCode) && pattern?.test(v.name));
  if (named) return named;

  // 2. Any voice for this language
  const any = voices.find(v => v.lang.startsWith(langCode));
  if (any) return any;

  // 3. Fallback to English
  return voices.find(v => v.lang.startsWith('en')) || null;
}

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback((text, language = 'en') => {
    if (!window.speechSynthesis) return;

    stop();

    const clean = stripMarkdown(text);
    if (!clean) return;

    const langCode = LANG_MAP[language] || 'en';
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.82;    // Slow, reflective pace
    utterance.pitch = 0.88;   // Slightly deeper
    utterance.volume = 1;

    const assignVoiceAndSpeak = () => {
      const voice = pickVoice(langCode);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang || `${langCode}-${langCode.toUpperCase()}`;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => { setSpeaking(false); utteranceRef.current = null; };
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') console.error('Speech error:', e.error);
        setSpeaking(false);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet on first call
    if (window.speechSynthesis.getVoices().length > 0) {
      assignVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        assignVoiceAndSpeak();
      };
    }
  }, [stop]);

  return { speak, stop, speaking };
}
