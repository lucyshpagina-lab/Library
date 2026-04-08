'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/common/SearchBar';
import BookGrid from '@/components/books/BookGrid';
import Pagination from '@/components/common/Pagination';
import Button from '@/components/ui/Button';
import { BookGridSkeleton } from '@/components/ui/Skeleton';
import { useBooks, useGenres } from '@/hooks/useBooks';
import { useDebounce } from '@/hooks/useDebounce';
import { BookFilters } from '@/types/book';
import { AlertCircle } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [genre, setGenre] = useState(searchParams.get('genre') || '');
  const [sortBy, setSortBy] = useState<BookFilters['sortBy']>(
    (searchParams.get('sortBy') as BookFilters['sortBy']) || 'date'
  );
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const debouncedSearch = useDebounce(search);
  const { data: genres } = useGenres();
  const { data, isLoading, isError, refetch } = useBooks({
    search: debouncedSearch || undefined,
    genre: genre || undefined,
    sortBy,
    order: (sortBy === 'title' || sortBy === 'author') ? 'asc' : 'desc',
    page,
    limit: 12,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (genre) params.set('genre', genre);
    if (sortBy && sortBy !== 'date') params.set('sortBy', sortBy);
    if (page > 1) params.set('page', String(page));
    router.replace(`/catalog?${params}`, { scroll: false });
  }, [debouncedSearch, genre, sortBy, page, router]);

  return (
    <>
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">Book Catalog</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as BookFilters['sortBy']); setPage(1); }}
          className="bg-white border border-gray-200 rounded-[10px] text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-accent text-center appearance-none"
          style={{ padding: '10px' }}
          aria-label="Sort books"
        >
          <option value="date">🕐 Newest</option>
          <option value="rating">⭐ Top Rated</option>
          <option value="title">🔤 Title A-Z</option>
          <option value="author">✍️ Author A-Z</option>
        </select>
      </div>

      {/* Genre filters */}
      {genres && genres.length > 0 && (
        <div
          className="flex gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible"
          role="group"
          aria-label="Filter by genre"
        >
          <Button
            variant={genre === '' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setGenre(''); setPage(1); }}
            className="flex-shrink-0"
          >
            All
          </Button>
          {genres.map((g) => (
            <Button
              key={g}
              variant={genre === g ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => { setGenre(g); setPage(1); }}
              className="flex-shrink-0"
            >
              {g}
            </Button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <BookGridSkeleton count={12} />
      ) : isError ? (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-text-secondary mb-4">Something went wrong loading books.</p>
          <Button variant="secondary" onClick={() => refetch()}>Try Again</Button>
        </div>
      ) : data && (
        <>
          <p className="text-sm text-text-secondary mb-4">
            {data.total} book{data.total !== 1 ? 's' : ''} found
          </p>
          <BookGrid books={data.books} />
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}

export default function CatalogPage() {
  return (
    <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <Suspense fallback={<BookGridSkeleton count={12} />}>
          <CatalogContent />
        </Suspense>
      </div>
    </main>
  );
}
