'use client';

import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types/user';

export function useAuth() {
  const { user, isLoading, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading: queryLoading, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await api.get<{ user: User }>('/auth/me');
      return res.data.user;
    },
    retry: false,
  });

  useEffect(() => {
    if (!queryLoading) {
      if (data) {
        setUser(data);
      } else if (isError && !user) {
        setUser(null);
      }
    }
  }, [data, queryLoading, isError, setUser, user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await api.post<{ user: User }>('/auth/login', credentials);
      return res.data.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; username: string; password: string }) => {
      const res = await api.post<{ user: User }>('/auth/register', data);
      return res.data.user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
    },
  });

  return {
    user,
    setUser,
    isLoading: isLoading && queryLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
