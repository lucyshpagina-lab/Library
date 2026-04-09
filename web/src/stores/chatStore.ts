'use client';

import { create } from 'zustand';
import { ChatMessage } from '@/types/chat';

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggleChat: () => void;
  setOpen: (open: boolean) => void;
  addMessage: (msg: ChatMessage) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi! I'm the Library Assistant. I can search books, give recommendations, manage your favorites, and answer questions. What would you like?",
      actions: [
        { type: 'quick_reply', label: 'Search books', value: 'search books' },
        { type: 'quick_reply', label: 'Recommendations', value: 'recommend me a book' },
        { type: 'quick_reply', label: 'Help', value: 'help' },
      ],
      timestamp: Date.now(),
    },
  ],
  isLoading: false,
  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setLoading: (isLoading) => set({ isLoading }),
}));
