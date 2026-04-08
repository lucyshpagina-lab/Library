'use client';

import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import RatingStars from '@/components/common/Rating';
import { Book } from '@/types/book';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.id}`}
      className="block cursor-book"
      aria-label={`${book.title} by ${book.author}`}
    >
      <Card className="p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
        <div className="w-full h-40 sm:h-48 bg-sky-light rounded-lg flex items-center justify-center mb-3 overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-pink-accent opacity-40" />
          )}
        </div>
        <Badge className="self-start mb-2">{book.genre}</Badge>
        <h3 className="font-semibold text-text-primary line-clamp-2 mb-1 text-sm sm:text-base">
          {book.title}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary mb-2">{book.author}</p>
        <div className="mt-auto flex items-center gap-2">
          <RatingStars value={Math.round(book.avgRating)} size="sm" />
          <span className="text-xs text-text-secondary">({book.ratingsCount})</span>
        </div>
      </Card>
    </Link>
  );
}
