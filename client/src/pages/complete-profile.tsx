import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

const positions = [
  "Goalkeeper",
  "Right-back", 
  "Left-back",
  "Centre-back",
  "Defensive Midfielder", 
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger", 
  "Centre-forward",
  "Striker"
];

const countries = [
  "Germany", "Austria", "Switzerland", "Netherlands", "Belgium", "France", 
  "Spain", "Italy", "Portugal", "England", "Scotland", "Wales", "Ireland",
  "Poland", "Czech Republic", "Slovakia", "Hungary", "Croatia", "Serbia",
  "Bosnia and Herzegovina", "Slovenia", "Denmark", "Sweden", "Norway",
  "Finland", "Turkey", "Greece", "Bulgaria", "Romania", "Ukraine", "Russia",
  "Brazil", "Argentina", "Colombia", "Chile", "Uruguay", "Mexico", "USA",
  "Canada", "Japan", "South Korea", "Australia", "Nigeria", "Ghana", 
  "Cameroon", "Senegal", "Morocco", "Algeria", "Egypt", "South Africa"
];

const profileSchema = z.object({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  position: z.string().min(1, "Position is required"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      dateOfBirth: "",
      nationality: "",
      position: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest("/api/complete-profile", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been completed. Please wait for admin approval.",
      });
      // Redirect to waiting page
      window.location.href = "/waiting-approval";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    updateProfileMutation.mutate(data);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-fc-red rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-user-edit text-white text-xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Please provide additional information to complete your registration for the 1.FC Köln International Talent Program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="w-full"
                      />
                    </FormControl>
                    <FormDescription>
                      Your date of birth is required for age group classification.
                    </FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your nationality" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your nationality for official documentation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Position</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Your preferred playing position on the field.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-fc-red hover:bg-fc-red/90 text-white"
                disabled={isSubmitting || updateProfileMutation.isPending}
              >
                {isSubmitting || updateProfileMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check mr-2"></i>
                    Complete Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}