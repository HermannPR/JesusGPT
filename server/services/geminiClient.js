import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Groq models
const GROQ_MODEL_DEEP = 'llama-3.3-70b-versatile';   // Complex theology / Parable Mode
const GROQ_MODEL_FAST = 'llama-3.3-70b-versatile';   // Quick direct wisdom

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
    max_tokens: mode === 'parable' ? 600 : 300,
  });

  const raw = completion.choices[0]?.message?.content || '';
  // Strip <think>...</think> reasoning tags from models like Qwen3
  return raw.replace(/<think>[\s\S]*?<\/think>\s*/g, '').trim();
}

async function generateWithGemini(systemPrompt, userPrompt) {
  const gemini = getGemini();
  if (!gemini) throw new Error('Gemini not available');

  console.log('[Gemini] Fallback: using gemini-2.0-flash');
  const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
  });

  return result.response.text();
}

export async function generateReflection(question, relevantVerses, mode, language, history = []) {
  const systemPrompt = SYSTEM_PROMPTS[mode]?.[language] || SYSTEM_PROMPTS[mode].en;
  const context = buildContextPrompt(relevantVerses);
  const userPrompt = `${context}\n\nQuestion from the seeker: ${question}`;

  // Try Groq first, fall back to Gemini
  try {
    return await generateWithGroq(systemPrompt, userPrompt, mode, history);
  } catch (err) {
    console.warn(`[Groq] Failed: ${err.message}. Falling back to Gemini...`);
    try {
      return await generateWithGemini(systemPrompt, userPrompt);
    } catch (fallbackErr) {
      console.error(`[Gemini] Fallback also failed: ${fallbackErr.message}`);
      throw new Error('All AI providers failed. Please try again later.');
    }
  }
}
