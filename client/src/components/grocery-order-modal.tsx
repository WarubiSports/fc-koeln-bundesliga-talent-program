import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const groceryOrderSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  weekStartDate: z.string().min(1, "Week start date is required"),
  deliveryDay: z.enum(["monday", "thursday"]),
  proteins: z.string().optional(),
  vegetables: z.string().optional(),
  fruits: z.string().optional(),
  grains: z.string().optional(),
  snacks: z.string().optional(),
  beverages: z.string().optional(),
  supplements: z.string().optional(),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  estimatedCost: z.string().optional(),
});

type GroceryOrderFormData = z.infer<typeof groceryOrderSchema>;

interface GroceryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeek?: string;
}

// Get Monday of current week
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export default function GroceryOrderModal({ isOpen, onClose, selectedWeek }: GroceryOrderModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GroceryOrderFormData>({
    resolver: zodResolver(groceryOrderSchema),
    defaultValues: {
      playerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      weekStartDate: selectedWeek || getMondayOfWeek(new Date()),
      deliveryDay: "monday",
      proteins: "",
      vegetables: "",
      fruits: "",
      grains: "",
      snacks: "",
      beverages: "",
      supplements: "",
      specialRequests: "",
      dietaryRestrictions: "",
      estimatedCost: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: GroceryOrderFormData) => {
      return await apiRequest("/api/food-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Grocery order submitted successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit grocery order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GroceryOrderFormData) => {
    createOrderMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#DC143C]">
            New Weekly Grocery Order
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter player name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weekStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Week Start (Monday)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deliveryDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Day</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monday">📦 Monday</SelectItem>
                      <SelectItem value="thursday">📦 Thursday</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Grocery Categories</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="proteins"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🥩 Proteins</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Chicken breast, salmon, eggs, Greek yogurt, protein powder..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vegetables"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🥬 Vegetables</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Broccoli, spinach, carrots, bell peppers, tomatoes..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fruits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🍎 Fruits</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Bananas, apples, berries, oranges, avocados..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🍞 Grains & Carbs</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brown rice, quinoa, oats, whole grain bread, pasta..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="snacks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🥜 Healthy Snacks</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Nuts, protein bars, fruit, energy balls..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="beverages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>🥤 Beverages</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Water, sports drinks, coconut water, protein shakes..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supplements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>💊 Supplements</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Vitamins, protein powder, creatine, magnesium..."
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Cost (€)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="150.00" type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requests</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Organic preferences, specific brands, delivery instructions..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions & Allergies</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Lactose intolerant, gluten-free, nut allergies, vegetarian..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createOrderMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOrderMutation.isPending}
                className="bg-[#DC143C] hover:bg-[#B91C3C]"
              >
                {createOrderMutation.isPending ? "Submitting..." : "Submit Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}