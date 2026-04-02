'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface Progress {
  id: number;
  bookId: number;
  currentPage: number;
  scrollPosition: number;
}

export function useReadingProgress(bookId: number) {
  const user = useAuthStore((s) => s.user);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data: progress } = useQuery({
    queryKey: ['progress', bookId],
    queryFn: async () => {
      const res = await api.get<{ progress: Progress[] }>(`/progress?bookId=${bookId}`);
      return res.data.progress[0] || null;
    },
    enabled: !!user && !!bookId,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { currentPage: number; scrollPosition: number }) => {
      await api.post('/progress', { bookId, ...data });
    },
  });

  const saveProgress = useCallback(
    (scrollPosition: number, currentPage: number = 0) => {
      if (!user) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveMutation.mutate({ currentPage, scrollPosition });
      }, 2000);
    },
    [user, saveMutation, bookId],
  );

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return { progress, saveProgress };
}
