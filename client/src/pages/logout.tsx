import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Logout() {
  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call simple logout endpoint to clear session
        await apiRequest("POST", "/api/auth/simple-logout");
        
        // Redirect to landing page
        window.location.href = "/";
      } catch (error) {
        // Fallback - redirect to root
        window.location.href = "/";
      }
    };

    performLogout();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <LogOut className="h-8 w-8 text-gray-600" />
          </div>
          <CardTitle className="text-2xl">Signing Out</CardTitle>
          <p className="text-gray-600">Please wait while we sign you out...</p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        </CardContent>
      </Card>
    </div>
  );
}