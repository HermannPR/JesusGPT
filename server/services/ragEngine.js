const STOP_WORDS = new Set([
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
]);

// Common biblical themes mapped to related keywords for better matching
const THEME_MAP = {
  fear: ['afraid', 'fear', 'worry', 'anxious', 'troubled', 'courage'],
  anger: ['angry', 'wrath', 'fury', 'rage', 'forgive', 'forgiveness'],
  love: ['love', 'loved', 'loving', 'compassion', 'mercy', 'kindness'],
  death: ['death', 'die', 'dead', 'mourn', 'grief', 'life', 'eternal'],
  money: ['money', 'wealth', 'rich', 'poor', 'treasure', 'give', 'generous'],
  faith: ['faith', 'believe', 'trust', 'doubt', 'hope'],
  peace: ['peace', 'rest', 'calm', 'still', 'quiet', 'comfort'],
  sin: ['sin', 'repent', 'forgive', 'forgiveness', 'righteous', 'judge'],
  suffering: ['suffer', 'pain', 'affliction', 'trial', 'persecute', 'endure'],
  prayer: ['pray', 'prayer', 'ask', 'seek', 'knock', 'father'],
  lost: ['lost', 'found', 'seek', 'search', 'wander', 'return'],
  healing: ['heal', 'sick', 'blind', 'lame', 'whole', 'restore'],
};

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

function expandKeywords(keywords) {
  const expanded = new Set(keywords);
  for (const keyword of keywords) {
    for (const [, related] of Object.entries(THEME_MAP)) {
      if (related.includes(keyword)) {
        related.forEach(r => expanded.add(r));
      }
    }
  }
  return [...expanded];
}

export function findRelevantVerses(question, gospelData, language, maxResults = 8) {
  const langData = gospelData[language];
  if (!langData) return [];

  const keywords = expandKeywords(tokenize(question));
  if (keywords.length === 0) return [];

  const scored = [];

  for (const book of langData.books) {
    for (const chapter of book.chapters) {
      for (const verse of chapter.verses) {
        const lowerText = verse.text.toLowerCase();
        let score = 0;
        for (const kw of keywords) {
          if (lowerText.includes(kw)) score++;
        }
        if (score > 0) {
          scored.push({
            book: book.name,
            chapter: chapter.chapter,
            verse: verse.verse,
            text: verse.text,
            score,
          });
        }
      }
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
