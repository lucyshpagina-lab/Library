'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { BookListResponse, BookFilters, Book, Comment, Rating } from '@/types/book';

export function useBooks(filters: BookFilters = {}) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.genre) params.genre = filters.genre;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.order) params.order = filters.order;
      if (filters.page) params.page = String(filters.page);
      if (filters.limit) params.limit = String(filters.limit);
      const res = await api.get<BookListResponse>('/books', { params });
      return res.data;
    },
  });
}

export function useBook(id: number) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const res = await api.get<{
        book: Book & { comments: Comment[] };
        userRating: Rating | null;
      }>(`/books/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get<{ genres: string[] }>('/books/genres');
      return res.data.genres;
    },
  });
}
