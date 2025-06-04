import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { getCountryFlag } from "@/lib/country-flags";

const positions = [
  "Goalkeeper",
  "Defender", 
  "Midfielder",
  "Forward"
];

const roles = [
  { value: "player", label: "Player" },
  { value: "coach", label: "Coach" },
  { value: "staff", label: "Support Staff" },
  { value: "manager", label: "Team Manager" }
];



export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    nationalityCode: "",
    positions: [] as string[],
    role: "",
    phoneNumber: "",
    emergencyContact: "",
    emergencyPhone: "",
    profileImageUrl: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (position: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      positions: checked 
        ? [...prev.positions, position]
        : prev.positions.filter(p => p !== position)
    }));
  };

  const handleNationalityChange = (nationality: string) => {
    const nationalityCode = getCountryFlag(nationality);
    setFormData(prev => ({
      ...prev,
      nationality,
      nationalityCode
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Registration failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Registration failed", 
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest("/api/auth/register", "POST", {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
        nationalityCode: formData.nationalityCode,
        positions: formData.positions,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        profileImageUrl: formData.profileImageUrl
      });

      const data = await response.json();
      
      toast({
        title: "Registration successful",
        description: "Your application has been submitted for review",
      });

      // Clear form on success
      setFormData({
        username: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        nationality: "",
        nationalityCode: "",
        positions: [] as string[],
        role: "",
        phoneNumber: "",
        emergencyContact: "",
        emergencyPhone: "",
        profileImageUrl: ""
      });
      
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-700 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="bg-white shadow-2xl">
          <CardHeader className="text-center border-b bg-gray-50">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Join the FC Köln International Talent Program
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Complete your application for review by program administrators
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-700">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      required
                      placeholder="Choose a username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      placeholder="Min. 6 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      placeholder="Your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      placeholder="Your last name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-gray-700">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="text-gray-700">Nationality *</Label>
                    <Input
                      id="nationality"
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => handleNationalityChange(e.target.value)}
                      required
                      placeholder="e.g. German, Brazilian"
                    />
                  </div>
                </div>
                
                {/* Profile Picture Upload */}
                <div className="space-y-2">
                  <Label htmlFor="profileImage" className="text-gray-700">Profile Picture</Label>
                  <div className="flex items-start gap-4">
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700 file:cursor-pointer cursor-pointer"
                    />
                    {formData.profileImageUrl && (
                      <img src={formData.profileImageUrl} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                    )}
                  </div>
                </div>
              </div>

              {/* Program Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Program Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-700">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.role === "player" && (
                    <div className="space-y-2">
                      <Label className="text-gray-700">Positions * (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {positions.map((position) => (
                          <div key={position} className="flex items-center space-x-2">
                            <Checkbox
                              id={position}
                              checked={formData.positions.includes(position)}
                              onCheckedChange={(checked) => handlePositionChange(position, checked as boolean)}
                            />
                            <Label htmlFor={position} className="text-sm font-normal">
                              {position}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact" className="text-gray-700">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      placeholder="Full name of emergency contact"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone" className="text-gray-700">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                      placeholder="+49 123 456 7890"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-11"
                >
                  {isLoading ? "Submitting Application..." : "Submit Application"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-11" 
                  asChild
                >
                  <Link href="/">Back to Login</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-red-100 text-sm">
            Your application will be reviewed by program administrators
          </p>
          <p className="text-red-200 text-xs mt-1">
            You will be notified once your account is approved
          </p>
        </div>
      </div>
    </div>
  );
}