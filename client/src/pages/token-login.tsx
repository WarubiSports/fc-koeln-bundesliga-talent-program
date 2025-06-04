import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

export default function TokenLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("/api/auth/simple-login", "POST", {
        username,
        password
      });

      const data = await response.json();
      
      if (data.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
      } else {
        throw new Error("No token received");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-6">
            <img 
              src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
              alt="FC Köln Football School" 
              className="w-20 h-20 object-contain mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FC Köln</h1>
          <p className="text-red-100 text-lg">International Talent Program</p>
          <p className="text-red-200 text-sm mt-1">Management System</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">Team Access</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Sign in to access your dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-6 text-center space-y-3">
              <p className="text-xs text-gray-500">
                For access issues, contact your program administrator
              </p>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">New to the FC Köln ITP?</p>
                <Link href="/register" className="text-red-600 hover:text-red-700 font-medium text-sm">
                  Join the Bundesliga Talent Program Management System
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-sm">
            © 2024 FC Köln International Talent Program
          </p>
          <p className="text-red-200 text-xs mt-1">
            Widdersdorf Training Facility
          </p>
        </div>
      </div>
    </div>
  );
}