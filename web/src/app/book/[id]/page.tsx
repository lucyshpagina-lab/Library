'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBook } from '@/hooks/useBooks';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { BookDetailSkeleton } from '@/components/ui/Skeleton';
import RatingStars from '@/components/common/Rating';
import CommentList from '@/components/common/CommentList';
import api from '@/lib/api';
import { BookOpen, Heart, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';

export default function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookId = parseInt(id);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading, isError, refetch } = useBook(bookId);
  const isFavorite = useIsFavorite(bookId);
  const { addFavorite, removeFavorite } = useToggleFavorite();

  const rateMutation = useMutation({
    mutationFn: async (value: number) => {
      await api.post(`/books/${bookId}/ratings`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      addToast('Rating saved');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      addToast('Book deleted');
      router.push('/catalog');
    },
  });

  function handleDelete() {
    if (confirm('Are you sure you want to delete this book?')) {
      deleteMutation.mutate();
    }
  }

  function handleToggleFavorite() {
    if (isFavorite) {
      removeFavorite.mutate(bookId, {
        onSuccess: () => addToast('Removed from favorites'),
      });
    } else {
      addFavorite.mutate(bookId, {
        onSuccess: () => addToast('Added to favorites'),
        onError: () => addToast('Failed to add to favorites', 'error'),
      });
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <BookDetailSkeleton />
        </div>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            {isError ? 'Failed to load book' : 'Book not found'}
          </h2>
          <p className="text-text-secondary mb-4">
            {isError ? 'Please try again later.' : 'The book you are looking for does not exist.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => router.push('/catalog')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Browse Books
            </Button>
            {isError && <Button onClick={() => refetch()}>Retry</Button>}
          </div>
        </Card>
      </main>
    );
  }

  const { book, userRating } = data;

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <Card className="p-5 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
            {/* Cover */}
            <div className="w-full md:w-64 h-64 sm:h-80 bg-sky-light rounded-lg flex items-center justify-center flex-shrink-0">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover rounded-lg" />
              ) : (
                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-pink-accent opacity-40" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <Badge className="mb-3">{book.genre}</Badge>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 break-words">{book.title}</h1>
              <p className="text-base sm:text-lg text-text-secondary mb-4">{book.author}</p>

              <div className="flex items-center gap-3 mb-4">
                <RatingStars value={Math.round(book.avgRating)} />
                <span className="text-sm text-text-secondary">
                  {book.avgRating.toFixed(1)} ({book.ratingsCount} rating{book.ratingsCount !== 1 ? 's' : ''})
                </span>
              </div>

              <div className="flex gap-4 text-sm text-text-secondary mb-4">
                {book.publishedYear && <span>Published: {book.publishedYear}</span>}
                {book.pageCount > 0 && <span>{book.pageCount} pages</span>}
              </div>

              {book.description && (
                <p className="text-text-primary mb-6 leading-relaxed text-sm sm:text-base">{book.description}</p>
              )}

              <div className="flex gap-3 flex-wrap">
                <Button onClick={() => router.push(`/read/${book.id}`)}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Read Book
                </Button>
                {user && (
                  <>
                    <Button
                      variant={isFavorite ? 'primary' : 'secondary'}
                      onClick={handleToggleFavorite}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-white' : ''}`} />
                      <span className="hidden sm:inline">{isFavorite ? 'In Favorites' : 'Add to Favorites'}</span>
                      <span className="sm:hidden">{isFavorite ? 'Saved' : 'Save'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleDelete}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>

              {/* Quick actions */}
              <div className="grid gap-3 mt-6 pt-5 border-t border-gray-100">
                <button
                  onClick={() => router.push(`/read/${book.id}`)}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-light/60 to-sky-light/60 hover:from-pink-light hover:to-sky-light transition-all duration-300 hover:shadow-md"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform text-xl">
                    📖
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-pink-accent transition-colors">
                      Read &laquo;{book.title}&raquo;
                    </p>
                    <p className="text-xs text-text-secondary">Start reading this book now</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/read/${book.id}`)}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-sky-light/60 to-pink-light/30 hover:from-sky-light hover:to-pink-light/60 transition-all duration-300 hover:shadow-md"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform text-xl">
                    📑
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-pink-accent transition-colors">
                      Table of Contents
                    </p>
                    <p className="text-xs text-text-secondary">Browse chapters and sections</p>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/catalog?search=${encodeURIComponent(book.author)}`)}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-pink-light/30 to-sky-light/60 hover:from-pink-light/60 hover:to-sky-light transition-all duration-300 hover:shadow-md"
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform text-xl">
                    ✍️
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-text-primary group-hover:text-pink-accent transition-colors">
                      Books by {book.author}
                    </p>
                    <p className="text-xs text-text-secondary">Explore more from this author</p>
                  </div>
                </button>
              </div>

              {/* User rating */}
              {user && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-text-secondary mb-2">Your rating:</p>
                  <RatingStars
                    value={userRating?.value || 0}
                    onChange={(v) => rateMutation.mutate(v)}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Comments */}
        <div id="comments-section" className="mt-6 sm:mt-8">
          <CommentList bookId={bookId} comments={book.comments} />
        </div>
      </div>
    </main>
  );
}
