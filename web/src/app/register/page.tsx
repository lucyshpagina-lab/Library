import type { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free Library account to save books, track reading progress, and more.',
};

export default function RegisterPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <RegisterForm />
    </main>
  );
}
