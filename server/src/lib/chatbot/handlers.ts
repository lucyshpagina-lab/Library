import { prisma } from '../prisma';

interface BookSummary {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  genre: string;
  avgRating: number;
}

interface Action {
  type: 'navigate' | 'search' | 'quick_reply';
  label: string;
  value: string;
}

export interface ChatResponse {
  message: string;
  books?: BookSummary[];
  actions?: Action[];
}

const BOOK_SELECT = {
  id: true,
  title: true,
  author: true,
  coverUrl: true,
  genre: true,
  avgRating: true,
} as const;

export async function handleSearchBooks(params: Record<string, string>): Promise<ChatResponse> {
  const where: any = {};
  if (params.genre) where.genre = { contains: params.genre, mode: 'insensitive' };
  if (params.author) where.author = { contains: params.author, mode: 'insensitive' };
  if (params.query && !params.genre && !params.author) {
    where.OR = [
      { title: { contains: params.query, mode: 'insensitive' } },
      { author: { contains: params.query, mode: 'insensitive' } },
      { genre: { contains: params.query, mode: 'insensitive' } },
    ];
  }

  const books = await prisma.book.findMany({
    where,
    select: BOOK_SELECT,
    take: 5,
    orderBy: { avgRating: 'desc' },
  });

  if (books.length === 0) {
    const term = params.query || params.genre || params.author || 'that';
    return {
      message: `I couldn't find any books matching "${term}". Try a different search term or browse our catalog.`,
      actions: [
        { type: 'navigate', label: 'Browse Catalog', value: '/catalog' },
        { type: 'quick_reply', label: 'Show popular books', value: 'recommend popular books' },
      ],
    };
  }

  return {
    message: `I found ${books.length} book${books.length > 1 ? 's' : ''} for you:`,
    books,
  };
}

export async function handleRecommend(params: Record<string, string>): Promise<ChatResponse> {
  const where: any = {};
  if (params.genre) where.genre = { contains: params.genre, mode: 'insensitive' };

  let books = await prisma.book.findMany({
    where,
    select: BOOK_SELECT,
    take: 5,
    orderBy: { avgRating: 'desc' },
  });

  if (books.length === 0 && params.genre) {
    books = await prisma.book.findMany({
      select: BOOK_SELECT,
      take: 5,
      orderBy: { avgRating: 'desc' },
    });
    return {
      message: `No ${params.genre} books found, but here are our top-rated books:`,
      books,
    };
  }

  const prefix = params.genre ? `Top ${params.genre} books` : 'Here are some popular books';
  return { message: `${prefix} you might enjoy:`, books };
}

export async function handleBookmarkAdd(
  params: Record<string, string>,
  userId?: number,
): Promise<ChatResponse> {
  if (!userId) {
    return {
      message: 'You need to be logged in to add favorites. Please log in first.',
      actions: [{ type: 'navigate', label: 'Log In', value: '/login' }],
    };
  }

  if (!params.title) {
    return { message: 'Please tell me which book to add. For example: "add to favorites Dune"' };
  }

  const book = await prisma.book.findFirst({
    where: { title: { contains: params.title, mode: 'insensitive' } },
    select: BOOK_SELECT,
  });

  if (!book) {
    return {
      message: `I couldn't find a book called "${params.title}". Please check the title and try again.`,
    };
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_bookId: { userId, bookId: book.id } },
  });

  if (existing) {
    return { message: `"${book.title}" is already in your favorites!`, books: [book] };
  }

  await prisma.favorite.create({ data: { userId, bookId: book.id } });
  return {
    message: `Added "${book.title}" to your favorites!`,
    books: [book],
    actions: [{ type: 'navigate', label: 'View Favorites', value: '/favorites' }],
  };
}

export async function handleBookmarkRemove(
  params: Record<string, string>,
  userId?: number,
): Promise<ChatResponse> {
  if (!userId) {
    return {
      message: 'You need to be logged in to manage favorites. Please log in first.',
      actions: [{ type: 'navigate', label: 'Log In', value: '/login' }],
    };
  }

  if (!params.title) {
    return {
      message: 'Please tell me which book to remove. For example: "remove from favorites Dune"',
    };
  }

  const book = await prisma.book.findFirst({
    where: { title: { contains: params.title, mode: 'insensitive' } },
    select: { id: true, title: true },
  });

  if (!book) {
    return { message: `I couldn't find a book called "${params.title}".` };
  }

  await prisma.favorite.deleteMany({ where: { userId, bookId: book.id } });
  return {
    message: `Removed "${book.title}" from your favorites.`,
    actions: [{ type: 'navigate', label: 'View Favorites', value: '/favorites' }],
  };
}

export function handleFaqRegister(): ChatResponse {
  return {
    message:
      'To create an account:\n1. Click "Sign Up" in the top right\n2. Enter your username, email, and password\n3. Click "Register"\n\nYou\'ll be redirected to the home page once registered.',
    actions: [{ type: 'navigate', label: 'Sign Up', value: '/register' }],
  };
}

export function handleFaqDownload(): ChatResponse {
  return {
    message:
      'You can read any book directly on our website:\n1. Go to the catalog and find a book\n2. Click on the book to see details\n3. Click "Read Book" to start reading\n\nBooks are available online — no download needed!',
    actions: [{ type: 'navigate', label: 'Browse Catalog', value: '/catalog' }],
  };
}

export function handleFaqReview(): ChatResponse {
  return {
    message:
      'To leave a review:\n1. Open any book\'s detail page\n2. Scroll down to the comments section\n3. Type your comment and click "Post"\n4. You can also rate the book using the star rating\n\nNote: You need to be logged in to leave reviews.',
  };
}

export function handleFaqGeneral(): ChatResponse {
  return {
    message: "Here's what I can help you with:",
    actions: [
      { type: 'quick_reply', label: 'Search books', value: 'search books' },
      { type: 'quick_reply', label: 'Get recommendations', value: 'recommend me a book' },
      { type: 'quick_reply', label: 'How to register?', value: 'how to register' },
      { type: 'quick_reply', label: 'How to read a book?', value: 'how to download' },
      { type: 'quick_reply', label: 'How to leave a review?', value: 'how to review' },
    ],
  };
}

export function handleGreeting(): ChatResponse {
  return {
    message: "Hello! I'm the Library Assistant. How can I help you today?",
    actions: [
      { type: 'quick_reply', label: 'Search books', value: 'search books' },
      { type: 'quick_reply', label: 'Recommendations', value: 'recommend me a book' },
      { type: 'quick_reply', label: 'Help', value: 'help' },
    ],
  };
}

export function handleUnknown(): ChatResponse {
  return {
    message:
      "I'm not sure I understand. Could you rephrase that? Here are some things I can help with:",
    actions: [
      { type: 'quick_reply', label: 'Search books', value: 'search books' },
      { type: 'quick_reply', label: 'Recommendations', value: 'recommend me a book' },
      { type: 'quick_reply', label: 'Help', value: 'help' },
    ],
  };
}
