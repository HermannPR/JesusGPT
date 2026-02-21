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

// Load Gospel data once (Vercel caches between warm invocations)
let gospelData;
async function getGospelData() {
  if (!gospelData) {
    gospelData = await loadGospels(
      path.join(__dirname, '..', 'server', 'data', 'gospels.json')
    );
  }
  return gospelData;
}

app.use(async (req, res, next) => {
  req.gospelData = await getGospelData();
  next();
});

app.use('/api/reflect', reflectRouter);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'An error occurred.' });
});

export default app;
