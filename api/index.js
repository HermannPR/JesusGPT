import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadGospels } from '../server/services/bibleLoader.js';
import reflectRouter from '../server/routes/reflect.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

let gospelData;
async function getGospelData() {
  if (!gospelData) {
    const gospelPath = path.join(__dirname, '..', 'server', 'data', 'gospels.json');
    console.log('[init] Loading gospels from:', gospelPath);
    gospelData = await loadGospels(gospelPath);
    console.log('[init] Loaded languages:', Object.keys(gospelData));
  }
  return gospelData;
}

app.use(async (req, res, next) => {
  try {
    req.gospelData = await getGospelData();
    next();
  } catch (err) {
    console.error('[init] Failed to load gospel data:', err.message);
    res.status(500).json({ error: 'Failed to load Bible data: ' + err.message });
  }
});

app.use('/api/reflect', reflectRouter);

// Debug endpoint — shows env and file path info
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    dirname: __dirname,
    gospelLoaded: !!gospelData,
  });
});

app.use((err, req, res, next) => {
  console.error('[error]', err.message, err.stack);
  res.status(500).json({ error: err.message });
});

export default app;
