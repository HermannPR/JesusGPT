import { Router } from 'express';
import { findRelevantVerses } from '../services/ragEngine.js';
import { generateReflection } from '../services/geminiClient.js';

const router = Router();

const VALID_LANGUAGES = new Set(['en', 'es', 'la', 'gr']);
const VALID_MODES = new Set(['direct', 'parable']);

router.post('/', async (req, res, next) => {
  try {
    const { question, language, mode } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    if (!VALID_LANGUAGES.has(language)) {
      return res.status(400).json({ error: 'Invalid language' });
    }
    if (!VALID_MODES.has(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const relevantVerses = findRelevantVerses(
      question,
      req.gospelData,
      language,
      mode === 'parable' ? 10 : 5
    );

    const response = await generateReflection(question, relevantVerses, mode, language);

    res.json({
      response,
      verses: relevantVerses.map(v => ({
        reference: `${v.book} ${v.chapter}:${v.verse}`,
        text: v.text,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
