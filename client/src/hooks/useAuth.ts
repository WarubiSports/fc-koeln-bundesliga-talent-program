import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useState, useEffect } from "react";

export function useAuth() {
  const [tempUser, setTempUser] = useState(null);
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 0, // Always refetch to check current auth status
    gcTime: 0, // Don't cache auth data (v5 syntax)
  });

  // Check for temporary user data immediately and handle logout
  useEffect(() => {
    const tempUserData = localStorage.getItem('tempUserData');
    if (tempUserData) {
      try {
        const userData = JSON.parse(tempUserData);
        setTempUser(userData);
        // Keep the data for a short time to ensure smooth transition
        setTimeout(() => {
          localStorage.removeItem('tempUserData');
        }, 2000);
      } catch (error) {
        console.error('Error parsing temp user data:', error);
        localStorage.removeItem('tempUserData');
      }
    }

    // Listen for logout events
    const handleLogout = () => {
      setTempUser(null);
      localStorage.removeItem('tempUserData');
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.clear();
    };

    window.addEventListener('beforeunload', handleLogout);
    return () => window.removeEventListener('beforeunload', handleLogout);
  }, [queryClient]);

  const finalUser = user || tempUser;

  return {
    user: finalUser,
    isLoading: isLoading && !tempUser,
    isAuthenticated: !!finalUser,
    isAdmin: finalUser?.role === "admin",
    isPlayer: finalUser?.role === "player",
  };
}