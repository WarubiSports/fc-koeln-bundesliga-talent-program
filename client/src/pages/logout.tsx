import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Logout() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Clear token-based authentication
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } catch (error) {
        // Even if logout fails, clear local state and redirect
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = "/";
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6">
          <img 
            src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
            alt="FC Köln Football School" 
            className="w-16 h-16 object-contain mx-auto"
          />
        </div>
        <h2 className="text-2xl font-semibold mb-4 text-white">Signing Out</h2>
        <p className="text-red-100 mb-6">Thank you for using FC Köln Management System</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
      </div>
    </div>
  );
}