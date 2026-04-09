export type Intent =
  | 'SEARCH_BOOKS'
  | 'RECOMMEND'
  | 'FAQ_REGISTER'
  | 'FAQ_DOWNLOAD'
  | 'FAQ_REVIEW'
  | 'FAQ_GENERAL'
  | 'BOOKMARK_ADD'
  | 'BOOKMARK_REMOVE'
  | 'GREETING'
  | 'UNKNOWN';

interface DetectedIntent {
  intent: Intent;
  params: Record<string, string>;
}

const GENRES = [
  'fiction',
  'fantasy',
  'science fiction',
  'sci-fi',
  'horror',
  'romance',
  'mystery',
  'thriller',
  'detective',
  'biography',
  'history',
  'philosophy',
  'psychology',
  'poetry',
  'drama',
  'adventure',
  'classics',
  'humor',
  'self-help',
  'medical',
  'science',
  'children',
];

function extractGenre(text: string): string | null {
  const lower = text.toLowerCase();
  for (const genre of GENRES) {
    if (lower.includes(genre)) {
      if (genre === 'sci-fi') return 'Science Fiction';
      if (genre === 'detective') return 'Mystery';
      return genre.charAt(0).toUpperCase() + genre.slice(1);
    }
  }
  return null;
}

function extractAuthor(text: string): string | null {
  const byMatch = text.match(/(?:by|author)\s+["']?([^"'\n,]+)/i);
  return byMatch ? byMatch[1].trim() : null;
}

function extractAfterKeyword(text: string, keywords: string[]): string {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      return text
        .slice(idx + kw.length)
        .trim()
        .replace(/^["']|["']$/g, '');
    }
  }
  return text;
}

export function detectIntent(message: string): DetectedIntent {
  const text = message.trim();
  const lower = text.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening)|howdy)\b/i.test(lower)) {
    return { intent: 'GREETING', params: {} };
  }

  // Bookmark add
  if (/\b(add\s+to\s+(favorites?|bookmarks?)|bookmark|save\s+book|add\s+favorite)\b/i.test(lower)) {
    const title = extractAfterKeyword(text, [
      'add to favorites ',
      'add to favorite ',
      'bookmark ',
      'save book ',
      'add favorite ',
    ]);
    return { intent: 'BOOKMARK_ADD', params: { title } };
  }

  // Bookmark remove
  if (
    /\b(remove\s+from\s+(favorites?|bookmarks?)|unbookmark|remove\s+favorite|delete\s+favorite)\b/i.test(
      lower,
    )
  ) {
    const title = extractAfterKeyword(text, [
      'remove from favorites ',
      'remove from favorite ',
      'unbookmark ',
      'remove favorite ',
      'delete favorite ',
    ]);
    return { intent: 'BOOKMARK_REMOVE', params: { title } };
  }

  // FAQ - Register
  if (/\b(register|sign\s*up|create\s+(an?\s+)?account|how\s+to\s+register)\b/i.test(lower)) {
    return { intent: 'FAQ_REGISTER', params: {} };
  }

  // FAQ - Download / Read
  if (/\b(download|read\s+offline|how\s+to\s+(download|read))\b/i.test(lower)) {
    return { intent: 'FAQ_DOWNLOAD', params: {} };
  }

  // FAQ - Review
  if (
    /\b(how\s+to\s+(review|rate|comment|leave\s+a\s+review)|leave\s+review|write\s+review)\b/i.test(
      lower,
    )
  ) {
    return { intent: 'FAQ_REVIEW', params: {} };
  }

  // FAQ - General help
  if (/\b(help|what\s+can\s+you\s+do|commands|menu)\b/i.test(lower)) {
    return { intent: 'FAQ_GENERAL', params: {} };
  }

  // Recommend
  if (
    /\b(recommend|suggest|what\s+should\s+i\s+read|popular|best\s+books?|top\s+books?)\b/i.test(
      lower,
    )
  ) {
    const genre = extractGenre(lower);
    return { intent: 'RECOMMEND', params: genre ? { genre } : {} };
  }

  // Search books
  if (/\b(search|find|look\s*(?:ing)?\s*for|show\s+me|books?\s+(?:about|on))\b/i.test(lower)) {
    const genre = extractGenre(lower);
    const author = extractAuthor(text);
    const query = extractAfterKeyword(text, [
      'search ',
      'find ',
      'looking for ',
      'look for ',
      'show me ',
    ]);
    return {
      intent: 'SEARCH_BOOKS',
      params: {
        ...(genre && { genre }),
        ...(author && { author }),
        ...(query && { query }),
      },
    };
  }

  // Fallback: if message contains a known genre, treat as search
  const genre = extractGenre(lower);
  if (genre) {
    return { intent: 'SEARCH_BOOKS', params: { genre } };
  }

  return { intent: 'UNKNOWN', params: {} };
}
