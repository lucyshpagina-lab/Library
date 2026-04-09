'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Star } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage, ChatApiResponse } from '@/types/chat';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ChatWidget() {
  const { isOpen, messages, isLoading, toggleChat, addMessage, setLoading } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    addMessage({ id: Date.now().toString(), role: 'user', text: trimmed, timestamp: Date.now() });
    setInput('');
    setLoading(true);

    try {
      const res = await api.post<ChatApiResponse>('/chat/message', { message: trimmed });
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: res.data.message,
        books: res.data.books,
        actions: res.data.actions,
        timestamp: Date.now(),
      });
    } catch {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (
    action: ChatMessage['actions'] extends (infer T)[] | undefined ? T : never,
  ) => {
    if (!action) return;
    if (action.type === 'navigate') {
      router.push(action.value);
    } else if (action.type === 'quick_reply') {
      sendMessage(action.value);
    } else if (action.type === 'search') {
      router.push(`/catalog?search=${encodeURIComponent(action.value)}`);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        data-testid="chat-toggle"
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-pink-accent hover:bg-pink-hover text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          data-testid="chat-window"
          className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-pink-accent text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="font-semibold">Library Assistant</span>
            </div>
            <button onClick={toggleChat} className="hover:bg-white/20 rounded p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[380px]"
            data-testid="chat-messages"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-last' : ''}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-pink-accent text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Book cards */}
                  {msg.books && msg.books.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.books.map((book) => (
                        <a
                          key={book.id}
                          href={`/book/${book.id}`}
                          data-testid="chat-book-card"
                          className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-400">
                            {book.coverUrl ? (
                              <img
                                src={book.coverUrl}
                                alt=""
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              '📚'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {book.title}
                            </p>
                            <p className="text-xs text-gray-500">{book.author}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star size={10} className="fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-500">
                                {book.avgRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-300 mx-1">|</span>
                              <span className="text-xs text-pink-accent">{book.genre}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleAction(action)}
                          data-testid="chat-action"
                          className="text-xs px-3 py-1.5 rounded-full border border-pink-accent text-pink-accent hover:bg-pink-accent hover:text-white transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2 flex gap-1"
                  data-testid="chat-typing"
                >
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              ref={inputRef}
              data-testid="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 text-sm px-3 py-2 rounded-full border border-gray-200 focus:border-pink-accent focus:outline-none disabled:opacity-50"
            />
            <button
              data-testid="chat-send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-pink-accent text-white flex items-center justify-center hover:bg-pink-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
