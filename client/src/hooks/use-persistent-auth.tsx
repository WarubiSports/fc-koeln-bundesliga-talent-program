import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function usePersistentAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Check authentication status
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      
      try {
        const response = await apiRequest('/api/auth/user');
        return await response.json();
      } catch (error) {
        // Token might be invalid, clear it
        localStorage.removeItem('auth_token');
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mark as initialized after first check
  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  // Auto-refresh token periodically
  useEffect(() => {
    if (user && localStorage.getItem('auth_token')) {
      const interval = setInterval(() => {
        // Trigger a background refresh
        apiRequest('/api/auth/user').catch(() => {
          // Token might be expired, clear it
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        });
      }, 10 * 60 * 1000); // Every 10 minutes

      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    user,
    isLoading: isLoading || !isInitialized,
    isAuthenticated: !!user,
    error
  };
}