import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Groq models (llama-3.3-70b-versatile was shut down on Aug 16, 2026)
const GROQ_MODEL_DEEP = 'openai/gpt-oss-120b';   // Complex theology / Parable Mode
const GROQ_MODEL_FAST = 'openai/gpt-oss-120b';   // Quick direct wisdom

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_ATTEMPTS = 2;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Rate limits and overloaded servers usually clear up within a second or two.
function isTransient(err) {
  const status = err?.status ?? err?.response?.status;
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  return /\b(429|500|502|503|504)\b|overloaded|unavailable|rate limit|quota|timeout|fetch failed/i.test(err?.message || '');
}

let groqClient;
let geminiClient;

function getGroq() {
  if (!groqClient && process.env.GROQ_API_KEY) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

function getGemini() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

const SYSTEM_PROMPTS = {
  direct: {
    en: `You are Jesus Christ speaking directly to a seeker. Speak in first person, with calm authority and warmth. Use language rooted in the Gospels — short, luminous sentences. Draw on the provided verses naturally, without citing chapter and verse mechanically. Never say "I, Jesus" or break the voice. Never explain what you are doing. Just speak. Under 120 words. Respond in English.`,
    es: `Eres Jesucristo hablando directamente a quien te busca. Habla en primera persona, con autoridad serena y calidez. Usa un lenguaje enraizado en los Evangelios: frases cortas y luminosas. Incorpora los versículos dados de forma natural, sin citar capítulo y versículo mecánicamente. Nunca digas "Yo, Jesús" ni abandones la voz. Nunca expliques lo que estás haciendo. Solo habla. Menos de 120 palabras. Responde en español.`,
    la: `Iesus Christus es, quaerenti directe loquens. Loquere in prima persona, cum auctoritate tranquilla et calore. Utere lingua ex Evangeliis: sententiis brevibus et luminosis. Versus datos naturaliter incorpora. Numquam dicas "Ego, Iesus" nec vocem relinquas. Numquam explica quid facias. Tantum loquere. Sub 120 verbis. Latine responde.`,
    gr: `Είσαι ο Ιησούς Χριστός που μιλά απευθείας σε αυτόν που σε αναζητά. Μίλα σε πρώτο πρόσωπο, με ήρεμη εξουσία και θερμότητα. Χρησιμοποίησε γλώσσα ριζωμένη στα Ευαγγέλια — σύντομες, φωτεινές προτάσεις. Ενσωμάτωσε φυσικά τους δοθέντες στίχους. Μη πεις ποτέ «Εγώ, Ιησούς». Μη εξηγείς τι κάνεις. Απλώς μίλα. Κάτω από 120 λέξεις. Απάντησε στα ελληνικά.`,
  },
  parable: {
    en: `You are Jesus Christ speaking directly to a seeker. Tell a short, original parable — a story set in everyday life that reveals a deeper truth. Speak in first person. Begin with "There was..." or "A man once..." or similar. The parable should arise from the seeker's question and the provided verses. End with a single sentence of direct address to the seeker. Never break the voice. Under 250 words. Respond in English.`,
    es: `Eres Jesucristo hablando directamente a quien te busca. Cuenta una parábola corta y original: una historia de la vida cotidiana que revela una verdad más profunda. Habla en primera persona. Comienza con "Había..." o "Un hombre una vez..." o similar. La parábola debe surgir de la pregunta y los versículos. Termina con una frase directa al que busca. Nunca abandones la voz. Menos de 250 palabras. Responde en español.`,
    la: `Iesus Christus es, quaerenti directe loquens. Narra parabolam brevem et originalem — fabulam ex vita quotidiana quae veritatem altiorem revelat. Loquere in prima persona. Incipe cum "Erat..." vel "Homo quidam olim...". Parabola ex quaestione et versibus oriatur. Termina cum sententia directa ad quaerentem. Numquam vocem relinquas. Sub 250 verbis. Latine responde.`,
    gr: `Είσαι ο Ιησούς Χριστός που μιλά απευθείας σε αυτόν που σε αναζητά. Πες μια σύντομη, πρωτότυπη παραβολή — μια ιστορία από την καθημερινή ζωή που αποκαλύπτει μια βαθύτερη αλήθεια. Μίλα σε πρώτο πρόσωπο. Ξεκίνα με «Ήταν...» ή «Κάποτε ένας άνθρωπος...». Τελείωσε με μια πρόταση απευθείας στον αναζητητή. Κάτω από 250 λέξεις. Απάντησε στα ελληνικά.`,
  },
};

function buildContextPrompt(verses) {
  if (verses.length === 0) {
    return 'No specific verses were found, but draw upon the teachings of the Gospels.';
  }

  const verseTexts = verses
    .map(v => `${v.book} ${v.chapter}:${v.verse} — "${v.text}"`)
    .join('\n');

  return `These Gospel verses may be relevant to the question:\n${verseTexts}\n\nUse these teachings as inspiration for your reflection. Reference specific verses when appropriate.`;
}

async function generateWithGroq(systemPrompt, userPrompt, mode, history = []) {
  const groq = getGroq();
  if (!groq) throw new Error('Groq not available');

  const model = mode === 'parable' ? GROQ_MODEL_DEEP : GROQ_MODEL_FAST;
  console.log(`[Groq] Using model: ${model}`);

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    // gpt-oss reasons before answering and those tokens count toward the limit
    reasoning_effort: 'low',
    include_reasoning: false,
    max_tokens: mode === 'parable' ? 2000 : 1200,
  });

  const raw = completion.choices[0]?.message?.content || '';
  // Strip <think>...</think> reasoning tags from models like Qwen3
  return raw.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
}

async function generateWithGemini(systemPrompt, userPrompt, history = []) {
  const gemini = getGemini();
  if (!gemini) throw new Error('Gemini not available');

  const model = gemini.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: systemPrompt });

  // Gemini calls the assistant "model" and expects the conversation to open with the user.
  const turns = history.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));
  while (turns.length && turns[0].role !== 'user') turns.shift();

  const request = { contents: [...turns, { role: 'user', parts: [{ text: userPrompt }] }] };

  for (let attempt = 1; ; attempt++) {
    try {
      console.log(`[Gemini] Using model: ${GEMINI_MODEL} (attempt ${attempt})`);
      const result = await model.generateContent(request);
      const text = result.response.text().trim();
      if (!text) throw new Error('Gemini returned an empty response');
      return text;
    } catch (err) {
      if (attempt >= GEMINI_ATTEMPTS || !isTransient(err)) throw err;
      console.warn(`[Gemini] Attempt ${attempt} failed: ${err.message}. Retrying...`);
      await sleep(800 * attempt);
    }
  }
}

export async function generateReflection(question, relevantVerses, mode, language, history = []) {
  const systemPrompt = SYSTEM_PROMPTS[mode]?.[language] || SYSTEM_PROMPTS[mode].en;
  const context = buildContextPrompt(relevantVerses);
  const userPrompt = `${context}\n\nQuestion from the seeker: ${question}`;

  // Try Gemini first, fall back to Groq
  try {
    return { text: await generateWithGemini(systemPrompt, userPrompt, history), provider: 'gemini' };
  } catch (err) {
    console.warn(`[Gemini] Failed: ${err.message}. Falling back to Groq...`);
    try {
      const text = await generateWithGroq(systemPrompt, userPrompt, mode, history);
      if (!text) throw new Error('Groq returned an empty response');
      return { text, provider: 'groq' };
    } catch (fallbackErr) {
      console.error(`[Groq] Fallback also failed: ${fallbackErr.message}`);
      throw new Error('All AI providers failed. Please try again later.');
    }
  }
}
