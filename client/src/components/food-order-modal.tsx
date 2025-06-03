import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import type { InsertFoodOrder } from "@shared/schema";

const foodOrderSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  orderDate: z.string().min(1, "Order date is required"),
  mealType: z.enum(["breakfast", "lunch", "dinner"]),
  mainDish: z.string().optional(),
  sideDish: z.string().optional(),
  drink: z.string().optional(),
  specialRequests: z.string().optional(),
  allergies: z.string().optional(),
  estimatedCost: z.string().optional(),
  deliveryTime: z.string().optional(),
});

type FoodOrderFormData = z.infer<typeof foodOrderSchema>;

interface FoodOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export default function FoodOrderModal({ isOpen, onClose, selectedDate }: FoodOrderModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch players for dropdown
  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  const form = useForm<FoodOrderFormData>({
    resolver: zodResolver(foodOrderSchema),
    defaultValues: {
      playerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      orderDate: selectedDate || new Date().toISOString().split('T')[0],
      mealType: "lunch",
      mainDish: "",
      sideDish: "",
      drink: "",
      specialRequests: "",
      allergies: "",
      estimatedCost: "",
      deliveryTime: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: FoodOrderFormData) => {
      await apiRequest("/api/food-orders", {
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
        description: "Food order submitted successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit food order",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FoodOrderFormData) => {
    createOrderMutation.mutate(data);
  };

  // Pre-defined menu options based on typical FC Köln dining
  const mainDishOptions = [
    "Schnitzel with gravy",
    "Grilled chicken breast",
    "Pasta Bolognese",
    "Beef stir-fry",
    "Fish fillet with herbs",
    "Vegetarian curry",
    "Turkey sandwich",
    "Salmon with dill sauce",
    "Pork tenderloin",
    "Veggie burger",
  ];

  const sideDishOptions = [
    "Rice",
    "French fries",
    "Mashed potatoes",
    "Steamed vegetables",
    "Mixed salad",
    "Bread rolls",
    "Sweet potato wedges",
    "Quinoa",
    "Roasted vegetables",
    "Coleslaw",
  ];

  const drinkOptions = [
    "Water",
    "Orange juice",
    "Apple juice",
    "Sports drink",
    "Coffee",
    "Tea",
    "Protein shake",
    "Sparkling water",
    "Energy drink",
    "Milk",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#DC143C]">
            New Food Order
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select player" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {players.map((player: any) => (
                          <SelectItem 
                            key={player.id} 
                            value={`${player.firstName} ${player.lastName}`}
                          >
                            {player.firstName} {player.lastName}
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
                name="orderDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Date</FormLabel>
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
              name="mealType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meal Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="breakfast">🥐 Breakfast</SelectItem>
                      <SelectItem value="lunch">🍽️ Lunch</SelectItem>
                      <SelectItem value="dinner">🍲 Dinner</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="mainDish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Dish</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select main dish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mainDishOptions.map((dish) => (
                          <SelectItem key={dish} value={dish}>{dish}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sideDish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Side Dish</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select side dish" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sideDishOptions.map((dish) => (
                          <SelectItem key={dish} value={dish}>{dish}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="drink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drink</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select drink" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drinkOptions.map((drink) => (
                          <SelectItem key={drink} value={drink}>{drink}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input {...field} placeholder="12.50" type="number" step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Delivery Time</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12:30 PM" />
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
                      placeholder="Any special dietary requirements, cooking preferences, or additional requests..."
                      rows={3}
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
                  <FormLabel>Allergies & Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="List any food allergies, intolerances, or dietary restrictions..."
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