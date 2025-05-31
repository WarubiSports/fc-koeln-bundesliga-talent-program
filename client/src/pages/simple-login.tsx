import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export default function SimpleLogin() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (role: "admin" | "player") => {
    setIsLoading(true);
    
    // Simulate login by storing user data in localStorage
    const userData = {
      id: role === "admin" ? "admin-1" : "player-1",
      email: email || (role === "admin" ? "admin@fckoeln.de" : "player@fckoeln.de"),
      firstName: role === "admin" ? "Max" : "Player",
      lastName: role === "admin" ? "Bisinger" : "User", 
      role: role,
      profileImageUrl: null
    };
    
    localStorage.setItem("fc_koeln_user", JSON.stringify(userData));
    
    // Reload to trigger auth state change
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fc-red/5 to-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png"
            alt="FC Köln Football School" 
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            FC Köln Talent Program
          </h1>
          <p className="text-gray-600">
            Choose your access level to enter
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access System</CardTitle>
            <CardDescription>
              Select your role to enter the management system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleLogin("admin")}
                disabled={isLoading}
                className="w-full bg-fc-red hover:bg-fc-red/90 text-white"
              >
                <i className="fas fa-user-shield mr-2"></i>
                Enter as Admin
              </Button>
              
              <Button
                onClick={() => handleLogin("player")}
                disabled={isLoading}
                variant="outline"
                className="w-full border-fc-red text-fc-red hover:bg-fc-red hover:text-white"
              >
                <i className="fas fa-futbol mr-2"></i>
                Enter as Player
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Admin Access:</strong> Full system management</p>
              <p><strong>Player Access:</strong> View schedules, submit excuses</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}