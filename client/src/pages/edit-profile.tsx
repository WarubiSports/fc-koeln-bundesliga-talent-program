import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Save, Upload, ArrowLeft } from "lucide-react";
import { COUNTRIES, getCountryFlag } from "@/lib/country-flags";

const profileSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  nationalityCode: z.string().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward", "winger", "striker", "center-back", "fullback", "defensive-midfielder", "attacking-midfielder"]).optional(),
  preferredFoot: z.enum(["left", "right", "both"]).optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  previousClub: z.string().optional(),
  profileImageUrl: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).optional(),
}).refine((data) => {
  // Only validate required fields
  return true;
}, {
  message: "Only first name, last name, and email are required",
});

type ProfileFormData = z.infer<typeof profileSchema>;

const positions = [
  "goalkeeper",
  "defender", 
  "midfielder",
  "forward",
  "winger",
  "striker",
  "center-back",
  "fullback",
  "defensive-midfielder",
  "attacking-midfielder"
];

const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];

export default function EditProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get current user profile data
  const { data: profileData, isLoading: profileLoading } = useQuery<any>({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  });

  const form = useForm<ProfileFormData>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: undefined,
      dateOfBirth: "",
      nationality: "",
      nationalityCode: "",
      position: undefined,
      preferredFoot: undefined,
      height: undefined,
      weight: undefined,
      previousClub: "",
      profileImageUrl: "",
      emergencyContactName: undefined,
      emergencyContactPhone: undefined,
      medicalConditions: "",
      allergies: "",
      house: undefined,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profileData) {
      form.reset({
        firstName: (profileData as any).firstName || "",
        lastName: (profileData as any).lastName || "",
        email: (profileData as any).email || "",
        phoneNumber: (profileData as any).phoneNumber || undefined,
        dateOfBirth: (profileData as any).dateOfBirth || "",
        nationality: (profileData as any).nationality || "",
        nationalityCode: (profileData as any).nationalityCode || "",
        position: (profileData as any).position || undefined,
        preferredFoot: (profileData as any).preferredFoot || undefined,
        height: (profileData as any).height || undefined,
        weight: (profileData as any).weight || undefined,
        previousClub: (profileData as any).previousClub || "",
        profileImageUrl: (profileData as any).profileImageUrl || "",
        emergencyContactName: (profileData as any).emergencyContactName || undefined,
        emergencyContactPhone: (profileData as any).emergencyContactPhone || undefined,
        medicalConditions: (profileData as any).medicalConditions || "",
        allergies: (profileData as any).allergies || "",
        house: (profileData as any).house || undefined,
      });
    }
  }, [profileData, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest("PUT", "/api/auth/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Form data:", data);
    console.log("Form errors:", form.formState.errors);
    
    // Manual validation for required fields only
    if (!data.firstName || data.firstName.length < 2) {
      form.setError("firstName", { message: "First name is required" });
      return;
    }
    if (!data.lastName || data.lastName.length < 2) {
      form.setError("lastName", { message: "Last name is required" });
      return;
    }
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
      form.setError("email", { message: "Valid email is required" });
      return;
    }
    
    updateProfileMutation.mutate(data);
  };

  // Handle nationality selection and auto-populate country code
  const handleNationalityChange = (nationality: string) => {
    const countryData = COUNTRIES.find((country: any) => country.name === nationality);
    if (countryData) {
      form.setValue("nationality", nationality);
      form.setValue("nationalityCode", countryData.code);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return "";
    return getCountryFlag(countryCode);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-gray-600">
          Update your personal information and preferences
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={form.watch("profileImageUrl")} />
                <AvatarFallback className="text-lg">
                  {getInitials(form.watch("firstName"), form.watch("lastName"))}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="profileImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/your-photo.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-gray-500">
                  Enter a URL to your profile image or upload it to an image hosting service
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <Select onValueChange={handleNationalityChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality">
                              {field.value && (
                                <span className="flex items-center gap-2">
                                  <span>{getFlagEmoji(form.watch("nationalityCode"))}</span>
                                  {field.value}
                                </span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country: any) => (
                            <SelectItem key={country.code} value={country.name}>
                              <span className="flex items-center gap-2">
                                <span>{getCountryFlag(country.code)}</span>
                                {country.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Football Information (for players) */}
          {user?.role === 'player' && (
            <Card>
              <CardHeader>
                <CardTitle>Football Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Position</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position.charAt(0).toUpperCase() + position.slice(1).replace('-', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preferredFoot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Foot</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred foot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="180" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previousClub"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Club</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter previous club name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="house"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Assignment</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={user?.role === 'player'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="House assignment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {houses.map((house) => (
                              <SelectItem key={house} value={house}>
                                {house}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {user?.role === 'player' && (
                          <p className="text-sm text-gray-500">House assignment can only be changed by admin</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Contact & Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Contact & Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emergencyContactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any medical conditions, injuries, or relevant health information..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List any allergies or dietary restrictions..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-[#DC143C] hover:bg-red-700"
            >
              {updateProfileMutation.isPending ? (
                "Updating..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}