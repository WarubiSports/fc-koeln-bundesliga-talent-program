import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [tempUser, setTempUser] = useState(null);
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always refetch to check current auth status
    gcTime: 0, // Don't cache auth data (v5 syntax)
  });

  // Check for temporary user data on mount
  useEffect(() => {
    const tempUserData = localStorage.getItem('tempUserData');
    if (tempUserData && !user) {
      try {
        const userData = JSON.parse(tempUserData);
        setTempUser(userData);
        // Clear the temporary data
        localStorage.removeItem('tempUserData');
      } catch (error) {
        console.error('Error parsing temp user data:', error);
        localStorage.removeItem('tempUserData');
      }
    }
  }, [user]);

  const finalUser = user || tempUser;

  return {
    user: finalUser,
    isLoading: isLoading && !tempUser,
    isAuthenticated: !!finalUser,
    isAdmin: finalUser?.role === "admin",
    isPlayer: finalUser?.role === "player",
  };
}