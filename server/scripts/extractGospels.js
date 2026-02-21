import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const BASE_URL = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json';

const SOURCES = {
  en: 'BSB.json',
  es: 'SpaRV.json',
  la: 'Vulgate.json',
  gr: 'GreVamvas.json',
};

// All translations in this repo use English book names
const GOSPEL_NAMES = new Set(['Matthew', 'Mark', 'Luke', 'John']);

async function downloadFile(url) {
  console.log(`  Downloading ${url}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  return response.json();
}

function extractGospels(bibleData) {
  const books = bibleData.books.filter(book => GOSPEL_NAMES.has(book.name.trim()));
  return {
    translation: bibleData.translation,
    books,
  };
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const gospels = {};

  for (const [lang, filename] of Object.entries(SOURCES)) {
    console.log(`Processing ${lang} (${filename})...`);
    try {
      const data = await downloadFile(`${BASE_URL}/${filename}`);
      gospels[lang] = extractGospels(data);
      const verseCount = gospels[lang].books.reduce(
        (sum, b) => sum + b.chapters.reduce((s, c) => s + c.verses.length, 0),
        0
      );
      console.log(`  Found ${gospels[lang].books.length} books, ${verseCount} verses`);
    } catch (err) {
      console.error(`  Error processing ${lang}: ${err.message}`);
    }
  }

  const outPath = path.join(DATA_DIR, 'gospels.json');
  await fs.writeFile(outPath, JSON.stringify(gospels));
  console.log(`\nGospel data written to ${outPath}`);
}

main().catch(console.error);
