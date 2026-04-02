'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReaderState {
  fontSize: number;
  theme: 'day' | 'night';
  lineHeight: number;
  setFontSize: (size: number) => void;
  setTheme: (theme: 'day' | 'night') => void;
  setLineHeight: (height: number) => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set) => ({
      fontSize: 18,
      theme: 'day',
      lineHeight: 1.8,
      setFontSize: (fontSize) => set({ fontSize: Math.min(28, Math.max(14, fontSize)) }),
      setTheme: (theme) => set({ theme }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
    }),
    { name: 'reader-settings' },
  ),
);
