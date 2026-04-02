'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { Comment } from '@/types/book';
import { MessageCircle, User } from 'lucide-react';

interface CommentListProps {
  bookId: number;
  comments: Comment[];
}

export default function CommentList({ bookId, comments }: CommentListProps) {
  const [text, setText] = useState('');
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const addComment = useMutation({
    mutationFn: async (text: string) => {
      const res = await api.post(`/books/${bookId}/comments`, { text });
      return res.data.comment;
    },
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      addToast('Comment posted');
    },
    onError: () => {
      addToast('Failed to post comment', 'error');
    },
  });

  return (
    <section aria-label="Comments">
      <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comments ({comments.length})
      </h3>

      {user && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (text.trim()) addComment.mutate(text); }}
          className="mb-6 flex flex-col sm:flex-row gap-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            maxLength={1000}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-[10px] text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-pink-accent transition-shadow"
            aria-label="Write a comment"
          />
          <Button type="submit" size="sm" disabled={!text.trim() || addComment.isPending}>
            {addComment.isPending ? 'Posting...' : 'Post'}
          </Button>
        </form>
      )}

      {!user && comments.length === 0 && (
        <p className="text-text-secondary text-sm">Sign in to be the first to comment.</p>
      )}

      <div className="space-y-3">
        {comments.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-pink-light flex items-center justify-center flex-shrink-0">
                <User className="w-3.5 h-3.5 text-pink-accent" />
              </div>
              <span className="font-medium text-sm text-text-primary">{comment.user.username}</span>
              <span className="text-xs text-text-secondary">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-text-primary text-sm leading-relaxed pl-8">{comment.text}</p>
          </Card>
        ))}
        {comments.length === 0 && user && (
          <p className="text-text-secondary text-sm">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </section>
  );
}
