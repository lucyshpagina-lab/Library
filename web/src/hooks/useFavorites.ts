'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { Book } from '@/types/book';

interface Favorite {
  id: number;
  bookId: number;
  book: Pick<Book, 'id' | 'title' | 'author' | 'coverUrl' | 'genre' | 'avgRating' | 'ratingsCount'>;
}

export function useFavorites() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get<{ favorites: Favorite[] }>('/favorites');
      return res.data.favorites;
    },
    enabled: !!user,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  const addFavorite = useMutation({
    mutationFn: async (bookId: number) => {
      await api.post('/favorites', { bookId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const removeFavorite = useMutation({
    mutationFn: async (bookId: number) => {
      await api.delete(`/favorites/${bookId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return { addFavorite, removeFavorite };
}

export function useIsFavorite(bookId: number): boolean {
  const { data: favorites } = useFavorites();
  if (!favorites) return false;
  return favorites.some((f) => f.book.id === bookId);
}
