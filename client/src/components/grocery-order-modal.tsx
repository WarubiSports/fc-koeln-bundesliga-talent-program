import { useState, useMemo } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { groceryCategories, groceryData, getCategoryDisplayName, type GroceryCategory } from "@/lib/grocery-data";

const groceryOrderSchema = z.object({
  playerName: z.string().min(1, "Player name is required"),
  weekStartDate: z.string().min(1, "Week start date is required"),
  deliveryDay: z.enum(["monday", "thursday"]),
  selectedItems: z.record(z.string(), z.number()).default({}),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
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
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const form = useForm<GroceryOrderFormData>({
    resolver: zodResolver(groceryOrderSchema),
    defaultValues: {
      playerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      weekStartDate: selectedWeek || getMondayOfWeek(new Date()),
      deliveryDay: "monday",
      selectedItems: {},
      specialRequests: "",
      dietaryRestrictions: "",
    },
  });

  const totalCost = useMemo(() => {
    return Object.entries(selectedItems).reduce((total, [itemName, quantity]) => {
      const allItems = Object.values(groceryData).flat();
      const item = allItems.find(i => i.name === itemName);
      return total + (item ? item.price * quantity : 0);
    }, 0);
  }, [selectedItems]);

  const handleItemToggle = (itemName: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (checked) {
        newItems[itemName] = 1;
      } else {
        delete newItems[itemName];
      }
      return newItems;
    });
  };

  const handleQuantityChange = (itemName: string, quantity: number) => {
    if (quantity <= 0) {
      setSelectedItems(prev => {
        const newItems = { ...prev };
        delete newItems[itemName];
        return newItems;
      });
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [itemName]: quantity
      }));
    }
  };

  const formatSelectedItemsForSubmission = () => {
    const categories: Record<string, string[]> = {};
    
    Object.entries(selectedItems).forEach(([itemName, quantity]) => {
      const allItems = Object.values(groceryData).flat();
      const item = allItems.find(i => i.name === itemName);
      if (item) {
        const categoryName = getCategoryDisplayName(item.category as GroceryCategory);
        if (!categories[categoryName]) {
          categories[categoryName] = [];
        }
        categories[categoryName].push(`${itemName} (${quantity}x)`);
      }
    });

    return categories;
  };

  const createOrderMutation = useMutation({
    mutationFn: async (data: GroceryOrderFormData) => {
      const formattedItems = formatSelectedItemsForSubmission();
      
      // Format the data to match the existing grocery order schema
      const orderData = {
        playerName: data.playerName,
        weekStartDate: data.weekStartDate,
        deliveryDay: data.deliveryDay,
        proteins: formattedItems["Meat & Protein"]?.join(", ") || "",
        vegetables: formattedItems["Vegetables & Fruits"]?.join(", ") || "",
        fruits: formattedItems["Vegetables & Fruits"]?.join(", ") || "",
        grains: formattedItems["Carbohydrates"]?.join(", ") || "",
        snacks: formattedItems["Carbohydrates"]?.join(", ") || "",
        beverages: formattedItems["Drinks & Beverages"]?.join(", ") || "",
        supplements: formattedItems["Spices & Sauces"]?.join(", ") || "",
        specialRequests: data.specialRequests || "",
        dietaryRestrictions: data.dietaryRestrictions || "",
        estimatedCost: totalCost.toFixed(2),
      };

      return await apiRequest("POST", "/api/food-orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Grocery order submitted successfully",
      });
      form.reset();
      setSelectedItems({});
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
    if (Object.keys(selectedItems).length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item for your grocery order",
        variant: "destructive",
      });
      return;
    }
    createOrderMutation.mutate({ ...data, selectedItems });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#DC143C]">
            New Weekly Grocery Order
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Order deadline: Monday 8am (Tuesday delivery) • Thursday 8am (Friday delivery)
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <SelectItem value="monday">Tuesday Delivery (Order by Monday 8am)</SelectItem>
                        <SelectItem value="thursday">Friday Delivery (Order by Thursday 8am)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Grocery Selection */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Select Grocery Items</h3>
                <div className="text-lg font-bold text-[#DC143C]">
                  Total: €{totalCost.toFixed(2)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groceryCategories.map((category) => (
                  <Card key={category} className="h-fit">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        {getCategoryDisplayName(category)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {groceryData[category].map((item) => (
                        <div key={item.name} className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <Checkbox
                              checked={item.name in selectedItems}
                              onCheckedChange={(checked) => 
                                handleItemToggle(item.name, checked as boolean)
                              }
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{item.name}</div>
                              <div className="text-xs text-gray-500">€{item.price.toFixed(2)}</div>
                            </div>
                          </div>
                          {item.name in selectedItems && (
                            <Input
                              type="number"
                              min="1"
                              value={selectedItems[item.name]}
                              onChange={(e) => 
                                handleQuantityChange(item.name, parseInt(e.target.value) || 0)
                              }
                              className="w-16 h-8 text-xs"
                            />
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
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
                {createOrderMutation.isPending ? "Submitting..." : `Submit Order (€${totalCost.toFixed(2)})`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}