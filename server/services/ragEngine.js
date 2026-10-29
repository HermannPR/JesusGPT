// Lowercase, strip accents/diacritics and normalize Greek final sigma so that
// "Φοβάμαι" matches "φοβαμαι" and "perdonaré" matches "perdonare".
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ς/g, 'σ');
}

function words(text) {
  return normalize(text)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// Crude stemmer: trims inflection so a question word matches its other forms
// ("forgive" → "forgi", "perdonar" → "perdon", "συγχωρησω" → "συγχωρη").
function stem(word) {
  if (word.length >= 7) return word.slice(0, -3);
  if (word.length >= 5) return word.slice(0, -2);
  return word;
}

const STOP_WORDS = {
  en: [
    'the', 'is', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now',
    'do', 'did', 'has', 'have', 'had', 'was', 'were', 'be', 'been', 'being',
    'am', 'are', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he',
    'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
    'would', 'could', 'does', 'feel', 'want', 'know', 'get', 'make', 'really',
  ],
  es: [
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'o', 'pero',
    'en', 'con', 'por', 'para', 'del', 'al', 'que', 'como', 'cuando', 'donde',
    'porque', 'por que', 'cual', 'quien', 'quienes', 'mas', 'muy', 'tan', 'ya',
    'yo', 'mi', 'mis', 'me', 'tu', 'tus', 'te', 'se', 'su', 'sus', 'nos',
    'nosotros', 'ellos', 'ella', 'ellas', 'ese', 'esa', 'eso', 'este', 'esta',
    'esto', 'estos', 'estas', 'hay', 'ser', 'estar', 'soy', 'eres', 'estoy',
    'esta', 'tengo', 'tiene', 'tener', 'hacer', 'hago', 'debo', 'deberia',
    'puedo', 'puede', 'quiero', 'siento', 'sin', 'sobre', 'entre', 'hasta',
    'desde', 'todo', 'toda', 'todos', 'algo', 'nada', 'cada', 'otro', 'otra',
    'senor', 'jesus', 'dios',
  ],
  la: [
    'et', 'in', 'ad', 'est', 'sunt', 'non', 'cum', 'de', 'ex', 'ab', 'quod',
    'qui', 'quae', 'quid', 'quis', 'ut', 'sed', 'autem', 'enim', 'ego', 'tu',
    'mihi', 'me', 'te', 'meus', 'mea', 'meum', 'tuus', 'nos', 'vos', 'sum',
    'esse', 'quomodo', 'debeo', 'possum', 'volo', 'hic', 'haec', 'hoc', 'ille',
    'illa', 'per', 'pro', 'sine', 'nunc', 'iam', 'dominus', 'domine', 'deus',
  ],
  gr: [
    'και', 'να', 'το', 'τον', 'την', 'του', 'τησ', 'των', 'τα', 'τουσ', 'τισ',
    'ο', 'η', 'οι', 'σε', 'με', 'απο', 'για', 'πωσ', 'τι', 'ποιοσ', 'μου',
    'σου', 'μασ', 'σασ', 'εγω', 'εσυ', 'ειμαι', 'ειναι', 'δεν', 'μη', 'μην',
    'αλλα', 'οταν', 'που', 'αυτο', 'αυτοσ', 'πρεπει', 'μπορω', 'θελω', 'θα',
    'κυριε', 'κυριοσ', 'θεοσ', 'ιησου',
  ],
};

const STOP_SETS = Object.fromEntries(
  Object.entries(STOP_WORDS).map(([lang, list]) => [lang, new Set(list.map(normalize))])
);

// Common biblical themes mapped to related keywords for better matching
const THEME_MAP = {
  en: {
    fear: ['afraid', 'fear', 'worry', 'anxious', 'troubled', 'courage'],
    anger: ['angry', 'wrath', 'fury', 'rage', 'forgive', 'forgiveness'],
    love: ['love', 'loved', 'loving', 'compassion', 'mercy', 'kindness'],
    death: ['death', 'die', 'dying', 'dead', 'mourn', 'grief', 'life', 'eternal'],
    money: ['money', 'wealth', 'rich', 'poor', 'treasure', 'give', 'generous'],
    faith: ['faith', 'believe', 'trust', 'doubt', 'hope'],
    peace: ['peace', 'rest', 'calm', 'still', 'quiet', 'comfort'],
    sin: ['sin', 'repent', 'forgive', 'forgiveness', 'righteous', 'judge'],
    suffering: ['suffer', 'pain', 'affliction', 'trial', 'persecute', 'endure'],
    prayer: ['pray', 'prayer', 'ask', 'seek', 'knock', 'father'],
    lost: ['lost', 'found', 'seek', 'search', 'wander', 'return'],
    healing: ['heal', 'sick', 'blind', 'lame', 'whole', 'restore'],
  },
  es: {
    fear: ['miedo', 'temor', 'temer', 'temais', 'angustia', 'turbado', 'animo'],
    anger: ['enojo', 'ira', 'enojado', 'perdonar', 'perdon'],
    love: ['amor', 'amar', 'amad', 'misericordia', 'compasion'],
    death: ['muerte', 'morir', 'muerto', 'llorar', 'vida', 'eterna'],
    money: ['dinero', 'riqueza', 'rico', 'pobre', 'tesoro', 'dar'],
    faith: ['fe', 'creer', 'creed', 'confiar', 'duda', 'esperanza'],
    peace: ['paz', 'descanso', 'calma', 'consuelo'],
    sin: ['pecado', 'pecar', 'arrepentir', 'perdonar', 'juzgar'],
    suffering: ['sufrir', 'dolor', 'aflicción', 'persecucion', 'perseverar'],
    prayer: ['orar', 'oracion', 'pedir', 'pedid', 'buscad', 'llamad', 'padre'],
    lost: ['perdido', 'hallado', 'buscar', 'volver'],
    healing: ['sanar', 'enfermo', 'ciego', 'cojo', 'sano'],
  },
  la: {
    fear: ['timor', 'timere', 'timete', 'nolite', 'turbetur', 'confidite'],
    anger: ['ira', 'iratus', 'dimittere', 'dimittite'],
    love: ['amor', 'diligere', 'diligite', 'caritas', 'misericordia'],
    death: ['mors', 'mortem', 'mori', 'mortuus', 'vita', 'vitam', 'aeternam'],
    money: ['pecunia', 'divitiae', 'dives', 'pauper', 'thesaurus', 'date'],
    faith: ['fides', 'fidem', 'credere', 'credite', 'spes'],
    peace: ['pax', 'pacem', 'requies', 'requiem', 'consolatio'],
    sin: ['peccatum', 'peccata', 'paenitentia', 'dimittere', 'iudicare'],
    suffering: ['pati', 'passio', 'dolor', 'tribulatio', 'persecutionem'],
    prayer: ['orare', 'orate', 'oratio', 'petite', 'quaerite', 'pulsate', 'pater'],
    lost: ['perditus', 'perierat', 'inventus', 'quaerere', 'reverti'],
    healing: ['sanare', 'curare', 'infirmus', 'caecus', 'claudus', 'sanus'],
  },
  gr: {
    fear: ['φοβ', 'μεριμν', 'ταραχ', 'θαρσειτε'],
    anger: ['οργη', 'θυμ', 'συγχωρ', 'αφεσ'],
    love: ['αγαπ', 'ελεοσ', 'σπλαγχν'],
    death: ['θανατ', 'αποθαν', 'νεκρ', 'πενθ', 'ζωη', 'ζωην', 'αιωνι'],
    money: ['χρημα', 'πλουσ', 'πτωχ', 'θησαυρ', 'δοτε'],
    faith: ['πιστ', 'πιστευ', 'ελπιδ', 'διστασ'],
    peace: ['ειρην', 'αναπαυσ', 'παρηγορ'],
    sin: ['αμαρτ', 'μετανο', 'συγχωρ', 'κρινε'],
    suffering: ['πασχ', 'θλιψ', 'διωγμ', 'υπομεν'],
    prayer: ['προσευχ', 'αιτειτε', 'ζητειτε', 'κρουετε', 'πατερ'],
    lost: ['απολωλ', 'ευρεθ', 'ζητ', 'επιστρεψ'],
    healing: ['θεραπευ', 'ιασ', 'ασθεν', 'τυφλ', 'χωλ', 'υγι'],
  },
};

const THEME_STEMS = Object.fromEntries(
  Object.entries(THEME_MAP).map(([lang, themes]) => [
    lang,
    Object.values(themes).map(list => list.map(w => stem(normalize(w)))),
  ])
);

function tokenize(text, language) {
  const stop = STOP_SETS[language] || STOP_SETS.en;
  return words(text).filter(word => word.length > 2 && !stop.has(word));
}

// Returns Map<stem, weight>; words typed by the seeker count more than theme expansions.
function expandKeywords(tokens, language) {
  const weights = new Map();
  for (const token of tokens) weights.set(stem(token), 1);
  const themes = THEME_STEMS[language] || THEME_STEMS.en;
  for (const token of tokens) {
    for (const related of themes) {
      if (related.some(r => token.startsWith(r) || r.startsWith(stem(token)))) {
        for (const r of related) if (!weights.has(r)) weights.set(r, 0.6);
      }
    }
  }
  return weights;
}

// Normalized words per verse, built once per language.
const indexCache = new WeakMap();

function getIndex(langData) {
  let index = indexCache.get(langData);
  if (!index) {
    index = [];
    for (const book of langData.books) {
      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          index.push({ book: book.name, chapter: chapter.chapter, verse: verse.verse, text: verse.text, words: words(verse.text) });
        }
      }
    }
    indexCache.set(langData, index);
  }
  return index;
}

export function findRelevantVerses(question, gospelData, language, maxResults = 8) {
  const langData = gospelData[language];
  if (!langData) return [];

  const keywords = expandKeywords(tokenize(question, language), language);
  if (keywords.size === 0) return [];

  const index = getIndex(langData);
  const hits = new Map();
  for (const kw of keywords.keys()) hits.set(kw, []);

  index.forEach((entry, i) => {
    for (const kw of keywords.keys()) {
      if (entry.words.some(w => w.startsWith(kw))) hits.get(kw).push(i);
    }
  });

  // Rare words say more about a verse than common ones (inverse document frequency).
  const scores = new Map();
  for (const [kw, verseIds] of hits) {
    if (verseIds.length === 0) continue;
    const weight = keywords.get(kw) * Math.log(1 + index.length / verseIds.length);
    for (const i of verseIds) scores.set(i, (scores.get(i) || 0) + weight);
  }

  return [...scores]
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(([i, score]) => {
      const { book, chapter, verse, text } = index[i];
      return { book, chapter, verse, text, score: Math.round(score * 100) / 100 };
    });
}
