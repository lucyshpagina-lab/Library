'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { useToastStore } from '@/stores/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';
import { BookOpen, Heart, Menu, X } from 'lucide-react';

function UserAvatar({ username, avatarUrl, size = 'sm' }: { username: string; avatarUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'md' ? 'w-10 h-10 text-base' : 'w-20 h-20 text-3xl';
  if (avatarUrl) {
    const src = avatarUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${avatarUrl}` : avatarUrl;
    return <img src={src} alt={username} className={`${dims} rounded-full object-cover`} />;
  }
  return (
    <div className={`${dims} rounded-full bg-pink-accent text-white flex items-center justify-center font-semibold`}>
      {username.charAt(0).toUpperCase()}
    </div>
  );
}

type ModalType = 'password' | 'username' | 'avatar' | null;

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const { data: favorites } = useFavorites();
  const favCount = favorites?.length ?? 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  async function handleLogout() {
    await logout();
    addToast('Logged out successfully');
    setDropdownOpen(false);
    setMobileOpen(false);
  }

  function openModal(type: ModalType) {
    setModal(type);
    setDropdownOpen(false);
    setMobileOpen(false);
  }

  const dropdownItems = [
    { emoji: '📸', label: 'Change Avatar', action: () => openModal('avatar') },
    { emoji: '🔑', label: 'Change Password', action: () => openModal('password') },
    { emoji: '✏️', label: 'Change Username', action: () => openModal('username') },
    { emoji: '👋', label: 'Log Out', action: handleLogout },
  ];

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-text-primary">
            <BookOpen className="w-6 h-6 text-pink-accent" />
            Library
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link href="/catalog" className="text-text-secondary hover:text-pink-accent transition-colors">
              Catalog
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/favorites"
                      className="relative transition-colors"
                      aria-label="Favorites"
                    >
                      <Heart className={`w-5 h-5 ${favCount > 0 ? 'text-red-500 fill-red-500' : 'text-text-secondary hover:text-pink-accent'}`} />
                      {favCount > 0 && (
                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {favCount > 99 ? '99+' : favCount}
                        </span>
                      )}
                    </Link>
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                      >
                        <UserAvatar username={user.username} avatarUrl={user.avatarUrl} />
                        <span className="text-sm text-text-secondary max-w-[120px] truncate">{user.username}</span>
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <UserAvatar username={user.username} avatarUrl={user.avatarUrl} size="md" />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-text-primary truncate">{user.username}</p>
                                <p className="text-xs text-text-secondary truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          {dropdownItems.map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-sky-soft hover:text-pink-accent transition-colors flex items-center gap-3"
                            >
                              <span className="text-base">{item.emoji}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">Sign In</Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-pink-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav
            className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3"
            aria-label="Mobile navigation"
          >
            <Link
              href="/catalog"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-text-secondary hover:text-pink-accent transition-colors"
            >
              Catalog
            </Link>

            {!isLoading && (
              <>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <UserAvatar username={user.username} avatarUrl={user.avatarUrl} />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.username}</p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/favorites"
                      onClick={() => setMobileOpen(false)}
                      className={`block py-2 transition-colors ${favCount > 0 ? 'text-red-500 font-medium' : 'text-text-secondary hover:text-pink-accent'}`}
                    >
                      ❤️ Favorites {favCount > 0 && `(${favCount})`}
                    </Link>
                    {dropdownItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="block w-full text-left py-2 text-text-secondary hover:text-pink-accent transition-colors"
                      >
                        {item.emoji} {item.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">Sign In</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1">
                      <Button size="sm" className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
        )}
      </header>

      {/* Modals */}
      {modal && (
        <ModalOverlay onClose={() => setModal(null)}>
          {modal === 'password' && <ChangePasswordModal onClose={() => setModal(null)} />}
          {modal === 'username' && <ChangeUsernameModal onClose={() => setModal(null)} />}
          {modal === 'avatar' && <ChangeAvatarModal onClose={() => setModal(null)} />}
        </ModalOverlay>
      )}
    </>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="animate-in w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) { setError('New passwords do not match'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      addToast('Password changed successfully!');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-text-primary mb-1">🔑 Change Password</h2>
      <p className="text-sm text-text-secondary mb-4">Enter your current and new password</p>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="currentPassword" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
        <Input id="newPassword" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} />
        <Input id="confirmNewPassword" label="Repeat New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required minLength={8} />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</Button>
        </div>
      </form>
    </Card>
  );
}

function ChangeUsernameModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(user?.username || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.put('/user/profile', { username });
      const updated = { ...user!, username: res.data.user.username };
      setUser(updated);
      queryClient.setQueryData(['auth', 'me'], updated);
      addToast('Username changed successfully!');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change username');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-text-primary mb-1">✏️ Change Username</h2>
      <p className="text-sm text-text-secondary mb-4">Choose a new username</p>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input id="username" label="New Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter new username" required minLength={3} maxLength={20} />
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Change Username'}</Button>
        </div>
      </form>
    </Card>
  );
}

function ChangeAvatarModal({ onClose }: { onClose: () => void }) {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const addToast = useToastStore((s) => s.addToast);
  const fileRef = useRef<HTMLInputElement>(null);

  const avatarSrc = user?.avatarUrl
    ? (user.avatarUrl.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatarUrl}` : user.avatarUrl)
    : null;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await api.post('/user/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updated = { ...user!, avatarUrl: res.data.user.avatarUrl };
      setUser(updated);
      queryClient.setQueryData(['auth', 'me'], updated);
      addToast('Avatar updated!');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError('');
    setLoading(true);
    try {
      const res = await api.delete('/user/avatar');
      const updated = { ...user!, avatarUrl: res.data.user.avatarUrl };
      setUser(updated);
      queryClient.setQueryData(['auth', 'me'], updated);
      addToast('Avatar removed');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-text-primary mb-1">📸 Change Avatar</h2>
      <p className="text-sm text-text-secondary mb-4">Upload a new photo or remove current one</p>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-[10px] text-sm">{error}</div>}

      <div className="flex flex-col items-center gap-4 mb-6">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Current avatar" className="w-24 h-24 rounded-full object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-pink-accent text-white flex items-center justify-center text-4xl font-semibold">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      <div className="flex gap-3 justify-center">
        <Button onClick={() => fileRef.current?.click()} disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {user?.avatarUrl && (
          <Button variant="secondary" onClick={handleDelete} disabled={loading}>
            Remove
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </Card>
  );
}
