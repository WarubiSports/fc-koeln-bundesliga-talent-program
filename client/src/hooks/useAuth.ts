import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user data from backend
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
  });

  useEffect(() => {
    // Check for stored authentication token
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    
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
    isLoading: isLoading || userLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isPlayer: user?.role === "player",
    hasCompletedProfile,
    needsApproval: user && hasCompletedProfile && user?.approved === "false",
  };
}