import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useAuth() {
  const [localUser, setLocalUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for local storage user
    const storedUser = localStorage.getItem("fc_koeln_user");
    if (storedUser) {
      setLocalUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Try API auth first, fall back to local storage
  const { data: apiUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const user = apiUser || localUser;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isPlayer: user?.role === "player",
  };
}