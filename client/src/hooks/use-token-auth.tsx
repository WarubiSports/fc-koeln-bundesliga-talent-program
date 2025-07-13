import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    setHasToken(!!token);
  }, []);

  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: hasToken, // Only run query if we have a token
    retry: (failureCount, error) => {
      // Retry on network errors but not on auth errors
      const isAuthError = error?.message?.includes('401') || error?.message?.includes('Unauthorized');
      return failureCount < 2 && !isAuthError;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 15 * 60 * 1000, // Auto-refresh every 15 minutes
  });

  // Monitor token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('auth_token');
      setHasToken(!!token);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setHasToken(false);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading && hasToken,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Extended functionality
  const canManageCalendar = context.user?.role === 'admin' || context.user?.role === 'coach';
  const canManagePlayers = context.user?.role === 'admin' || context.user?.role === 'coach';
  
  return {
    ...context,
    canManageCalendar,
    canManagePlayers
  };
}