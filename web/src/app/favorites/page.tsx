'use client';

import Link from 'next/link';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import RatingStars from '@/components/common/Rating';
import { BookOpen, Heart, Trash2 } from 'lucide-react';

export default function FavoritesPage() {
  const user = useAuthStore((s) => s.user);
  const { data: favorites, isLoading } = useFavorites();
  const { removeFavorite } = useToggleFavorite();
  const addToast = useToastStore((s) => s.addToast);

  function handleRemove(bookId: number, title: string) {
    removeFavorite.mutate(bookId, {
      onSuccess: () => addToast(`Removed "${title}" from favorites`),
    });
  }

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <Heart className="w-12 h-12 text-pink-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign in to see your favorites</h2>
          <p className="text-text-secondary mb-4">Save books you love and access them anytime</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">My Favorites</h1>

        {isLoading ? (
          <BookGridSkeleton count={4} />
        ) : !favorites || favorites.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <div className="text-6xl mb-4">💔</div>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl">😢</span>
              <span className="text-3xl">😂</span>
            </div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {user.username}{' '}is poor since doesn&apos;t like books
            </h2>
            <Link href="/catalog">
              <Button>Browse Books</Button>
            </Link>
          </Card>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-4">
              {favorites.length} book{favorites.length !== 1 ? 's' : ''} saved
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {favorites.map((fav) => (
                <Card key={fav.id} className="p-4 flex flex-col">
                  <Link href={`/book/${fav.book.id}`} className="flex-1">
                    <div className="w-full h-40 sm:h-48 bg-sky-light rounded-lg flex items-center justify-center mb-3">
                      {fav.book.coverUrl ? (
                        <img src={fav.book.coverUrl} alt={fav.book.title} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-pink-accent opacity-40" />
                      )}
                    </div>
                    <Badge className="mb-2">{fav.book.genre}</Badge>
                    <h3 className="font-semibold text-text-primary line-clamp-2 mb-1">{fav.book.title}</h3>
                    <p className="text-sm text-text-secondary mb-2">{fav.book.author}</p>
                    <RatingStars value={Math.round(fav.book.avgRating)} size="sm" />
                  </Link>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <Link href={`/read/${fav.book.id}`} className="flex-1">
                      <Button size="sm" className="w-full">
                        <BookOpen className="w-3 h-3 mr-1" /> Read
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.preventDefault(); handleRemove(fav.book.id, fav.book.title); }}
                      aria-label={`Remove ${fav.book.title} from favorites`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
