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
  refreshAuth: () => void;
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
      // Only retry on network errors, not auth errors
      const isAuthError = error?.message?.includes('401') || error?.message?.includes('Unauthorized');
      return failureCount < 1 && !isAuthError;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchInterval: false, // Disable auto-refresh to prevent kicks
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

  const refreshAuth = () => {
    refetch();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading && hasToken,
        error,
        logout,
        refreshAuth,
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