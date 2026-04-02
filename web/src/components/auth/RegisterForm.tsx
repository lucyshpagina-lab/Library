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

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register({ email, username, password });
      addToast('Account created successfully!');
      router.push('/');
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.error || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6 sm:p-8">
      <div className="flex justify-center mb-4">
        <BookOpen className="w-10 h-10 text-pink-accent" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center">Create Account</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
          minLength={3}
          maxLength={20}
          autoComplete="username"
        />
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
          placeholder="At least 8 characters"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Input
          id="confirmPassword"
          label="Repeat Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-pink-accent hover:text-pink-hover font-medium">
          Sign In
        </Link>
      </p>
    </Card>
  );
}
