import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center">
        <BookOpen className="w-16 h-16 text-pink-accent opacity-30 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <p className="text-lg text-text-secondary mb-6">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-pink-accent hover:bg-pink-hover text-white font-semibold px-6 py-2.5 rounded-[10px] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
