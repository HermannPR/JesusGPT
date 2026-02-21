import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadGospels } from './services/bibleLoader.js';
import reflectRouter from './routes/reflect.js';
import speechRouter from './routes/speech.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Load Gospel data into memory at startup
let gospelData;

async function init() {
  try {
    gospelData = await loadGospels(path.join(__dirname, 'data', 'gospels.json'));
    const langs = Object.keys(gospelData);
    console.log(`Gospel data loaded: ${langs.join(', ')}`);
    console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'set (' + process.env.GROQ_API_KEY.length + ' chars)' : 'MISSING'}`);
    console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? 'set' : 'MISSING'}`);
  } catch (err) {
    console.error('Failed to load Gospel data:', err.message);
    console.error('Run "npm run extract" first to download Bible data.');
    process.exit(1);
  }
}

// Attach gospelData to requests
app.use((req, res, next) => {
  req.gospelData = gospelData;
  next();
});

// Routes
app.use('/api/reflect', reflectRouter);
app.use('/api/speech', speechRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'An error occurred while processing your request.' });
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
