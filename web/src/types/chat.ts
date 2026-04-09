export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  books?: ChatBook[];
  actions?: ChatAction[];
  timestamp: number;
}

export interface ChatBook {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  genre: string;
  avgRating: number;
}

export interface ChatAction {
  type: 'navigate' | 'search' | 'quick_reply';
  label: string;
  value: string;
}

export interface ChatApiResponse {
  message: string;
  books?: ChatBook[];
  actions?: ChatAction[];
}
