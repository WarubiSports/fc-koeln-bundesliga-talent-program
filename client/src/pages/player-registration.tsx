import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Trophy, Phone, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCountryFlag, COUNTRIES, POSITION_DISPLAY_NAMES } from "@/lib/country-flags";
import { z } from "zod";

// Registration schema with all player categories except status and house
const registrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  nationalityCode: z.string().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward", "winger", "striker", "center-back", "fullback", "defensive-midfielder", "attacking-midfielder"]),
  positions: z.array(z.string()).min(1, "Select at least one position"),
  preferredFoot: z.enum(["left", "right", "both"]).default("right"),
  height: z.string().optional(),
  weight: z.string().optional(),
  jerseyNumber: z.string().optional(),
  previousClub: z.string().optional(),
  profileImageUrl: z.string().optional(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function PlayerRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      nationality: "",
      nationalityCode: "",
      position: "midfielder",
      positions: [],
      preferredFoot: "right",
      height: "",
      weight: "",
      jerseyNumber: "",
      previousClub: "",
      profileImageUrl: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      allergies: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      return await apiRequest("/api/players/register", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your player profile has been submitted for approval.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePositionChange = (position: string, checked: boolean) => {
    let newPositions = [...selectedPositions];
    if (checked) {
      newPositions.push(position);
    } else {
      newPositions = newPositions.filter(p => p !== position);
    }
    setSelectedPositions(newPositions);
    form.setValue("positions", newPositions);
    
    // Set primary position to first selected
    if (newPositions.length > 0 && Object.keys(POSITION_DISPLAY_NAMES).includes(newPositions[0])) {
      form.setValue("position", newPositions[0] as any);
    }
  };

  const handleNationalityChange = (nationality: string) => {
    const country = COUNTRIES.find(c => c.name === nationality);
    form.setValue("nationality", nationality);
    form.setValue("nationalityCode", country?.code || "");
  };

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Trophy className="h-6 w-6 text-red-600" />
              1.FC Köln Player Registration
            </CardTitle>
            <p className="text-gray-600">Complete your player profile to join the academy</p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                      <User className="h-5 w-5" />
                      Personal Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your first name" {...field} />
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your last name" {...field} />
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
                          <Select value={field.value} onValueChange={handleNationalityChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your nationality" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {COUNTRIES.map((country) => (
                                <SelectItem key={country.code} value={country.name}>
                                  {getCountryFlag(country.code)} {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                      <Mail className="h-5 w-5" />
                      Contact Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+49 123 456 7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Image URL (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="url" 
                              placeholder="https://example.com/your-photo.jpg"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Football Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 font-semibold text-lg">
                    <Trophy className="h-5 w-5" />
                    Football Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="positions"
                        render={() => (
                          <FormItem>
                            <FormLabel>Playing Positions (Select all that apply)</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(POSITION_DISPLAY_NAMES).map(([value, label]) => (
                                <div key={value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={value}
                                    checked={selectedPositions.includes(value)}
                                    onCheckedChange={(checked) => handlePositionChange(value, !!checked)}
                                  />
                                  <label htmlFor={value} className="text-sm">{label}</label>
                                </div>
                              ))}
                            </div>
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
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
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
                        name="previousClub"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Previous Club (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your previous club" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input placeholder="175" {...field} />
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
                              <Input placeholder="70" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="jerseyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Jersey Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Medical Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                      <Phone className="h-5 w-5" />
                      Emergency Contact
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="emergencyContactName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name of emergency contact" {...field} />
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
                          <FormLabel>Contact Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+49 123 456 7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-semibold text-lg">
                      <Heart className="h-5 w-5" />
                      Medical Information
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="medicalConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Conditions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any medical conditions we should be aware of"
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
                          <FormLabel>Allergies (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any allergies or dietary restrictions"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-6">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={registerMutation.isPending}
                    className="w-full md:w-auto px-8"
                  >
                    {registerMutation.isPending ? "Submitting Registration..." : "Submit Registration"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}