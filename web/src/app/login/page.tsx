import type { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Library account to access your favorites and reading progress.',
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <LoginForm />
    </main>
  );
}
