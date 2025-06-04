import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  dateOfBirth?: string;
  nationality?: string;
  position?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5000,
    gcTime: 10000,
  });

  // If there's an error, assume not authenticated
  const isAuthenticated = !!user && !error;
  const hasCompletedProfile = user?.dateOfBirth && user?.nationality && user?.position;

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role === "admin",
    isPlayer: user?.role === "player", 
    hasCompletedProfile,
    needsApproval: user && hasCompletedProfile && user?.status === "pending",
  };
}