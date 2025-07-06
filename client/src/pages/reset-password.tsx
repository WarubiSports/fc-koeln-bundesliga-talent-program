import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');
    if (resetToken) {
      setToken(resetToken);
    } else {
      toast({
        title: "Invalid reset link",
        description: "No reset token found in URL",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "No reset token available",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/api/auth/reset-password", "POST", {
        token,
        newPassword
      });

      const data = await response.json();
      
      setIsSuccess(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated successfully",
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center px-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Password Reset Complete</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Your password has been successfully updated
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You will be redirected to the login page in a few seconds.
            </p>
            
            <Link href="/login">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          <p className="text-red-200 text-sm mt-1">Password Reset</p>
        </div>

        {/* Reset Password Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">Set New Password</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Invalid Reset Link</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This reset link is invalid or has expired.
                  </p>
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-700">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Minimum 6 characters</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    className="h-11"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
            
            <div className="mt-6 text-center">
              <Link href="/login" className="text-red-600 hover:text-red-700 text-sm font-medium">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}