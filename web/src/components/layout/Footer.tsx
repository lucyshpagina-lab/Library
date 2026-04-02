import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-text-primary font-semibold">
            <BookOpen className="w-5 h-5 text-pink-accent" />
            Library
          </div>
          <p className="text-sm text-text-secondary">
            &copy; {new Date().getFullYear()} Library. Your online reading platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
