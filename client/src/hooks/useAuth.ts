import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  approved: string;
  dateOfBirth?: string;
  nationality?: string;
  position?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user data from backend only if token exists
  const token = localStorage.getItem('authToken');
  const { data: currentUser, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    // Clear any existing authentication state on page load
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsLoading(false);
  }, []);

  // Update user data with fresh data from backend
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      localStorage.setItem('userData', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const hasCompletedProfile = user?.dateOfBirth && user?.nationality && user?.position;

  return {
    user,
    isLoading: token ? (isLoading || userLoading) : isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isPlayer: user?.role === "player",
    hasCompletedProfile,
    needsApproval: user && hasCompletedProfile && user?.approved === "false",
  };
}