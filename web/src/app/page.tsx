'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import SearchBar from '@/components/common/SearchBar';
import BookGrid from '@/components/books/BookGrid';
import Button from '@/components/ui/Button';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import { useBooks } from '@/hooks/useBooks';
import { BookOpen } from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { data: popular, isLoading: loadingPopular, isError: errorPopular } = useBooks({ sortBy: 'rating', order: 'desc', limit: 8 });
  const { data: newest, isLoading: loadingNewest, isError: errorNewest } = useBooks({ sortBy: 'date', order: 'desc', limit: 8 });

  function handleSearch() {
    if (search.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(search)}`);
    }
  }

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-sky-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-pink-accent" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
              Discover Your Next Book
            </h1>
          </div>
          <p className="text-base sm:text-lg text-text-secondary mb-6 sm:mb-8 px-4">
            Browse, read, and manage your favorite books online
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by title or author..."
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">New Arrivals</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/catalog')}>
            View all
          </Button>
        </div>
        {loadingNewest ? (
          <BookGridSkeleton />
        ) : errorNewest ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">Failed to load books. Please try again later.</p>
          </div>
        ) : newest ? (
          <BookGrid books={newest.books} />
        ) : null}
      </section>

      {/* Popular Books */}
      <section className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Popular Books</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push('/catalog?sortBy=rating')}>
            View all
          </Button>
        </div>
        {loadingPopular ? (
          <BookGridSkeleton />
        ) : errorPopular ? (
          <div className="text-center py-8">
            <p className="text-text-secondary">Failed to load books. Please try again later.</p>
          </div>
        ) : popular ? (
          <BookGrid books={popular.books.filter(b => b.coverUrl)} />
        ) : null}
      </section>
    </main>
  );
}
