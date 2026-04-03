'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';
import { useGenres } from '@/hooks/useBooks';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { BookOpen, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddBookPage() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const { data: genres } = useGenres();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [content, setContent] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [publishedYear, setPublishedYear] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <BookOpen className="w-12 h-12 text-pink-accent mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Sign in to add books</h2>
          <p className="text-text-secondary mb-4">You need an account to add new books</p>
          <Link href="/login"><Button>Sign In</Button></Link>
        </Card>
      </main>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const finalGenre = genre === '__custom__' ? customGenre : genre;
    if (!finalGenre) { setError('Please select or enter a genre'); setLoading(false); return; }

    try {
      const res = await api.post('/books', {
        title,
        author,
        description: description || undefined,
        genre: finalGenre,
        content,
        pageCount: pageCount ? parseInt(pageCount) : 0,
        publishedYear: publishedYear ? parseInt(publishedYear) : undefined,
        coverUrl: coverUrl || undefined,
      });
      addToast(`"${title}" added successfully!`);
      router.push(`/book/${res.data.book.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
        <Card className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-pink-light flex items-center justify-center">
              <Plus className="w-5 h-5 text-pink-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Add New Book</h1>
              <p className="text-sm text-text-secondary">Share a book with the library</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="title" label="Title" value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title" required
            />
            <Input
              id="author" label="Author" value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name" required
            />

            <div>
              <label htmlFor="genre" className="block text-sm font-medium text-text-primary mb-1.5">Genre</label>
              <select
                id="genre" value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[10px] text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-accent"
                required
              >
                <option value="">Select a genre...</option>
                {genres?.map((g) => <option key={g} value={g}>{g}</option>)}
                <option value="__custom__">+ Custom genre</option>
              </select>
            </div>

            {genre === '__custom__' && (
              <Input
                id="customGenre" label="Custom Genre" value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="Enter genre name" required
              />
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
              <textarea
                id="description" value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the book..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[10px] text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-accent resize-none"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-text-primary mb-1.5">
                Content <span className="text-red-400">*</span>
              </label>
              <textarea
                id="content" value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Book content or excerpt..."
                rows={8} required
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-[10px] text-text-primary focus:outline-none focus:ring-2 focus:ring-pink-accent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="pageCount" label="Page Count" type="number" value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                placeholder="e.g. 350"
              />
              <Input
                id="publishedYear" label="Published Year" type="number" value={publishedYear}
                onChange={(e) => setPublishedYear(e.target.value)}
                placeholder="e.g. 2024"
              />
            </div>

            <Input
              id="coverUrl" label="Cover Image URL" value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />

            {coverUrl && (
              <div className="flex justify-center">
                <img src={coverUrl} alt="Cover preview" className="h-40 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Adding...' : 'Add Book'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
