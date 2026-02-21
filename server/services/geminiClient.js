import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Groq models
const GROQ_MODEL_DEEP = 'openai/gpt-oss-120b';       // Complex theology / Parable Mode
const GROQ_MODEL_FAST = 'qwen/qwen3-32b';             // Quick direct wisdom

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
    en: `You are a compassionate teacher responding in the style of Jesus Christ from the Gospels. Provide concise, direct wisdom. When quoting Jesus's words, always place them inside quotation marks. Speak with warmth, clarity, and authority. Keep responses under 150 words. Respond in English.`,
    es: `Eres un maestro compasivo que responde al estilo de Jesucristo de los Evangelios. Proporciona sabiduría concisa y directa. Cuando cites las palabras de Jesús, siempre colócalas entre comillas. Habla con calidez, claridad y autoridad. Mantén las respuestas bajo 150 palabras. Responde en español.`,
    la: `Es magister misericors more Iesu Christi ex Evangeliis respondens. Da sapientiam brevem et directam. Cum verba Iesu recitas, ea semper in signis citationis pone. Loquere cum calore, claritate et auctoritate. Responsiones sub 150 verbis tene. Latine responde.`,
    gr: `Είσαι ένας συμπονετικός δάσκαλος που απαντά με τον τρόπο του Ιησού Χριστού από τα Ευαγγέλια. Παρέχετε συνοπτική, άμεση σοφία. Όταν αναφέρετε τα λόγια του Ιησού, τοποθετήστε τα πάντα σε εισαγωγικά. Μιλήστε με θερμότητα, σαφήνεια και εξουσία. Κρατήστε τις απαντήσεις κάτω από 150 λέξεις. Απαντήστε στα ελληνικά.`,
  },
  parable: {
    en: `You are a compassionate teacher responding in the style of Jesus Christ from the Gospels. Tell a short parable or story that illuminates the question. When quoting Jesus's words, always place them inside quotation marks. Speak with warmth, wisdom, and narrative depth. Keep responses under 300 words. Respond in English.`,
    es: `Eres un maestro compasivo que responde al estilo de Jesucristo de los Evangelios. Cuenta una parábola corta o historia que ilumine la pregunta. Cuando cites las palabras de Jesús, siempre colócalas entre comillas. Habla con calidez, sabiduría y profundidad narrativa. Mantén las respuestas bajo 300 palabras. Responde en español.`,
    la: `Es magister misericors more Iesu Christi ex Evangeliis respondens. Narra parabolam brevem vel fabulam quae quaestionem illuminet. Cum verba Iesu recitas, ea semper in signis citationis pone. Loquere cum calore, sapientia et profunditate narrativa. Responsiones sub 300 verbis tene. Latine responde.`,
    gr: `Είσαι ένας συμπονετικός δάσκαλος που απαντά με τον τρόπο του Ιησού Χριστού από τα Ευαγγέλια. Πείτε μια σύντομη παραβολή ή ιστορία που φωτίζει την ερώτηση. Όταν αναφέρετε τα λόγια του Ιησού, τοποθετήστε τα πάντα σε εισαγωγικά. Μιλήστε με θερμότητα, σοφία και αφηγηματικό βάθος. Κρατήστε τις απαντήσεις κάτω από 300 λέξεις. Απαντήστε στα ελληνικά.`,
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

async function generateWithGroq(systemPrompt, userPrompt, mode) {
  const groq = getGroq();
  if (!groq) throw new Error('Groq not available');

  const model = mode === 'parable' ? GROQ_MODEL_DEEP : GROQ_MODEL_FAST;
  console.log(`[Groq] Using model: ${model}`);

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
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

export async function generateReflection(question, relevantVerses, mode, language) {
  const systemPrompt = SYSTEM_PROMPTS[mode]?.[language] || SYSTEM_PROMPTS[mode].en;
  const context = buildContextPrompt(relevantVerses);
  const userPrompt = `${context}\n\nQuestion from the seeker: ${question}`;

  // Try Groq first, fall back to Gemini
  try {
    return await generateWithGroq(systemPrompt, userPrompt, mode);
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
