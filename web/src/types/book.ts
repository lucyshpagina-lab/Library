export interface Book {
  id: number;
  title: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  genre: string;
  content: string;
  pageCount: number;
  publishedYear: number | null;
  avgRating: number;
  ratingsCount: number;
  createdAt: string;
}

export interface BookListResponse {
  books: Book[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BookFilters {
  search?: string;
  genre?: string;
  sortBy?: 'rating' | 'date' | 'title' | 'author';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Comment {
  id: number;
  userId: number;
  bookId: number;
  text: string;
  createdAt: string;
  user: { username: string; avatarUrl: string | null };
}

export interface Rating {
  id: number;
  userId: number;
  bookId: number;
  value: number;
}
