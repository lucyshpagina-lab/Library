'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/stores/toastStore';
import { AxiosError } from 'axios';
import { BookOpen } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showOops, setShowOops] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setShowOops(false);
    setLoading(true);

    try {
      await login({ email, password });
      addToast('Welcome back!');
      router.push('/');
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || 'Login failed');
      } else {
        setError('Login failed');
      }
      setShowOops(true);
    } finally {
      setLoading(false);
    }
  }

  if (showOops) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 sm:p-8 overflow-hidden">
        <div className="flex flex-col items-center text-center animate-oops-in">
          <div className="text-8xl mb-6 animate-oops-bounce">🫣</div>
          <p className="text-lg font-semibold text-text-primary mb-2 animate-oops-fade-up">
            Oops dear, let&apos;s find your valid credentials
          </p>
          <p className="text-lg font-semibold text-text-primary mb-6 animate-oops-fade-up-delay">
            or register you!
          </p>
          <div className="flex gap-3 animate-oops-fade-up-delay-2">
            <Button onClick={() => setShowOops(false)}>
              Try Again
            </Button>
            <Link href="/register">
              <Button variant="secondary">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="flex justify-center mb-4">
        <BookOpen className="w-10 h-10 text-pink-accent" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Sign In</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          autoComplete="email"
        />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-pink-accent hover:text-pink-hover font-medium">
          Sign Up
        </Link>
      </p>
    </Card>
  );
}
