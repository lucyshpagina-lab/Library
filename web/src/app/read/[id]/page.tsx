'use client';

import { use, useEffect, useRef, useState, useCallback } from 'react';
import { useBook } from '@/hooks/useBooks';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useReaderStore } from '@/stores/readerStore';
import ReaderToolbar from '@/components/reader/ReaderToolbar';
import Skeleton from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const bookId = parseInt(id);
  const router = useRouter();
  const { data, isLoading, isError } = useBook(bookId);
  const { progress, saveProgress } = useReadingProgress(bookId);
  const { fontSize, theme, lineHeight } = useReaderStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollPercent, setScrollPercent] = useState(0);
  const restoredRef = useRef(false);

  // Hide header/footer in reader mode
  useEffect(() => {
    document.body.setAttribute('data-reader', 'true');
    return () => document.body.removeAttribute('data-reader');
  }, []);

  // Restore scroll position
  useEffect(() => {
    if (progress && !restoredRef.current && contentRef.current) {
      restoredRef.current = true;
      window.scrollTo(0, progress.scrollPosition);
    }
  }, [progress]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    setScrollPercent(percent);
    saveProgress(scrollTop);
  }, [saveProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Save on page leave
  useEffect(() => {
    const handleBeforeUnload = () => saveProgress(window.scrollY);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgress]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-4">
          <Skeleton className="w-48 h-8 mb-8" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-5/6 h-4" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {isError ? 'Failed to load book content.' : 'Book not found.'}
          </p>
          <Button variant="secondary" onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const { book } = data;

  return (
    <div className={theme === 'night' ? 'bg-[#1a1a2e] min-h-screen' : 'bg-white min-h-screen'}>
      <ReaderToolbar title={book.title} progress={scrollPercent} />

      <article
        ref={contentRef}
        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: lineHeight,
          color: theme === 'night' ? '#e0e0e0' : '#1F2937',
        }}
      >
        {book.content.split('\n').map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ) : (
            <br key={i} />
          )
        ))}

        {/* End of book */}
        <div className={`text-center py-8 mt-8 border-t ${
          theme === 'night' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <p className={`text-sm mb-4 ${theme === 'night' ? 'text-gray-400' : 'text-text-secondary'}`}>
            End of book
          </p>
          <Button variant="secondary" onClick={() => router.push(`/book/${book.id}`)}>
            Back to Book Details
          </Button>
        </div>
      </article>
    </div>
  );
}
