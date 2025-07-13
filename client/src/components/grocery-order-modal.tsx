import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  deliveryDate: z.string().min(1, "Delivery date is required"),
  selectedItems: z.record(z.string(), z.number()).default({}),
});

type GroceryOrderFormData = z.infer<typeof groceryOrderSchema>;

interface GroceryOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeek?: string;
}

// Helper functions for delivery dates and deadlines
function getCurrentWeekDeliveryDates(): Array<{ date: string; label: string; deadline: string; isPastDeadline: boolean }> {
  const today = new Date();
  const deliveryDates = [];
  
  // Get current week's Monday (start of week)
  const currentWeekMonday = new Date(today);
  const dayOfWeek = today.getDay();
  const daysFromMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday (0) as last day of week
  currentWeekMonday.setDate(today.getDate() + daysFromMonday);
  
  // Get Tuesday and Friday of current week
  const tuesday = new Date(currentWeekMonday);
  tuesday.setDate(currentWeekMonday.getDate() + 1); // Tuesday
  
  const friday = new Date(currentWeekMonday);
  friday.setDate(currentWeekMonday.getDate() + 4); // Friday
  
  // Add Tuesday delivery option
  if (tuesday >= today || tuesday.toDateString() === today.toDateString()) {
    deliveryDates.push({
      date: tuesday.toISOString().split('T')[0],
      label: `Tuesday, ${tuesday.toLocaleDateString('en-GB')}`,
      deadline: getOrderingDeadline(tuesday),
      isPastDeadline: isOrderingDeadlinePassed(tuesday)
    });
  }
  
  // Add Friday delivery option
  if (friday >= today || friday.toDateString() === today.toDateString()) {
    deliveryDates.push({
      date: friday.toISOString().split('T')[0],
      label: `Friday, ${friday.toLocaleDateString('en-GB')}`,
      deadline: getOrderingDeadline(friday),
      isPastDeadline: isOrderingDeadlinePassed(friday)
    });
  }
  
  // If current week options are not available, show next week
  if (deliveryDates.length === 0) {
    const nextWeekTuesday = new Date(tuesday);
    nextWeekTuesday.setDate(tuesday.getDate() + 7);
    
    const nextWeekFriday = new Date(friday);
    nextWeekFriday.setDate(friday.getDate() + 7);
    
    deliveryDates.push({
      date: nextWeekTuesday.toISOString().split('T')[0],
      label: `Tuesday, ${nextWeekTuesday.toLocaleDateString('en-GB')}`,
      deadline: getOrderingDeadline(nextWeekTuesday),
      isPastDeadline: isOrderingDeadlinePassed(nextWeekTuesday)
    });
    
    deliveryDates.push({
      date: nextWeekFriday.toISOString().split('T')[0],
      label: `Friday, ${nextWeekFriday.toLocaleDateString('en-GB')}`,
      deadline: getOrderingDeadline(nextWeekFriday),
      isPastDeadline: isOrderingDeadlinePassed(nextWeekFriday)
    });
  }
  
  return deliveryDates;
}

function getOrderingDeadline(deliveryDate: Date): string {
  const deadline = new Date(deliveryDate);
  
  if (deliveryDate.getDay() === 2) { // Tuesday delivery
    // Monday 12pm deadline
    deadline.setDate(deliveryDate.getDate() - 1);
  } else { // Friday delivery
    // Thursday 12pm deadline
    deadline.setDate(deliveryDate.getDate() - 1);
  }
  
  deadline.setHours(12, 0, 0, 0);
  return deadline.toLocaleString('en-GB', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function isOrderingDeadlinePassed(deliveryDate: Date): boolean {
  const now = new Date();
  const deadline = new Date(deliveryDate);
  
  if (deliveryDate.getDay() === 2) { // Tuesday delivery
    // Monday 12pm deadline
    deadline.setDate(deliveryDate.getDate() - 1);
  } else { // Friday delivery
    // Thursday 12pm deadline
    deadline.setDate(deliveryDate.getDate() - 1);
  }
  
  deadline.setHours(12, 0, 0, 0);
  return now > deadline;
}

export default function GroceryOrderModal({ isOpen, onClose, selectedWeek }: GroceryOrderModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  // Fetch players for dropdown
  const { data: players = [] } = useQuery<any[]>({
    queryKey: ["/api/players"],
  });

  // Fetch users (staff/coaches) for dropdown
  const { data: allUsers = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/approved-users"],
  });

  // Get current user's full name for comparison
  const currentUserName = user ? `${user.firstName} ${user.lastName}` : "";
  
  // Filter people based on user role - regular players can only order for themselves
  const getAvailablePeopleForOrdering = (): any[] => {
    if (!user) return [];
    
    // Admins and coaches can order for any player or user
    if (user.role === 'admin' || user.role === 'coach' || user.role === 'staff' || user.role === 'manager') {
      // Combine players and users (staff/coaches) for ordering
      const combinedList = [
        ...players.map((p: any) => ({ ...p, type: 'player' })),
        ...allUsers.filter((u: any) => u.role !== 'player').map((u: any) => ({ ...u, type: 'user' }))
      ];
      return combinedList;
    }
    
    // Regular players can only order for themselves
    // Check if current user is a player
    const userAsPlayer = (players as any[]).find((player: any) => 
      `${player.firstName} ${player.lastName}` === currentUserName ||
      player.email === user.email
    );
    
    if (userAsPlayer) {
      return [{ ...userAsPlayer, type: 'player' }];
    }
    
    // If not a player, check if they're a staff/coach who can order for themselves
    if (user.role === 'coach' || user.role === 'staff') {
      const userAsStaff = allUsers.find((u: any) => u.email === user.email);
      if (userAsStaff) {
        return [{ ...userAsStaff, type: 'user' }];
      }
    }
    
    return [];
  };

  const availablePeopleForOrdering = getAvailablePeopleForOrdering();

  const availableDeliveryDates = getCurrentWeekDeliveryDates();

  const form = useForm<GroceryOrderFormData>({
    resolver: zodResolver(groceryOrderSchema),
    defaultValues: {
      playerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      deliveryDate: availableDeliveryDates.find(d => !d.isPastDeadline)?.date || availableDeliveryDates[0]?.date || "",
      selectedItems: {},
    },
  });

  const totalCost = useMemo(() => {
    return Object.entries(selectedItems).reduce((total, [itemName, quantity]) => {
      const allItems = Object.values(groceryData).flat();
      const item = allItems.find(i => i.name === itemName);
      // Exclude household items from budget calculation
      if (item && item.category !== 'household') {
        return total + (item.price * quantity);
      }
      return total;
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
      try {
        const formattedItems = formatSelectedItemsForSubmission();
        
        // Convert delivery date to weekStartDate and deliveryDay for backend compatibility
        const deliveryDate = new Date(data.deliveryDate);
        const isDeliveryTuesday = deliveryDate.getDay() === 2;
        
        // Calculate week start date (Monday of delivery week)
        const weekStart = new Date(deliveryDate);
        weekStart.setDate(deliveryDate.getDate() - (deliveryDate.getDay() - 1));
        const weekStartDate = weekStart.toISOString().split('T')[0];
        
        // Format the data to match the existing grocery order schema
        const orderData = {
          playerName: data.playerName,
          weekStartDate: weekStartDate,
          deliveryDay: isDeliveryTuesday ? "tuesday" : "friday",
          proteins: formattedItems["Meat & Protein"]?.join(", ") || "",
          vegetables: formattedItems["Vegetables & Fruits"]?.join(", ") || "",
          fruits: formattedItems["Vegetables & Fruits"]?.join(", ") || "",
          grains: formattedItems["Carbohydrates"]?.join(", ") || "",
          snacks: formattedItems["Carbohydrates"]?.join(", ") || "",
          beverages: formattedItems["Drinks & Beverages"]?.join(", ") || "",
          supplements: formattedItems["Spices & Sauces"]?.join(", ") || "",
          specialRequests: "",
          dietaryRestrictions: "",
          estimatedCost: totalCost.toFixed(2),
        };

        console.log("Submitting grocery order:", orderData);
        const result = await apiRequest("/api/food-orders", "POST", orderData);
        console.log("Grocery order submission result:", result);
        return result;
      } catch (error) {
        console.error("Grocery order submission error:", error);
        throw error;
      }
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
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to submit grocery order",
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
    
    if (totalCost > 35) {
      toast({
        title: "Order Limit Exceeded",
        description: "Maximum order amount is €35.00. Current total: €" + totalCost.toFixed(2),
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
          <DialogDescription className="text-sm text-gray-600">
            Order deadline: Monday 12pm (Tuesday delivery) • Thursday 12pm (Friday delivery)
          </DialogDescription>
          {(user?.role === 'player' || user?.role === 'coach' || user?.role === 'staff') && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-2">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can only place orders for yourself. If you need to order for someone else, please contact an admin.
              </p>
            </div>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order For</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePeopleForOrdering.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500 text-center">
                            No people available for ordering
                          </div>
                        ) : (
                          availablePeopleForOrdering
                            .filter((person: any, index: number, arr: any[]) => 
                              // Remove duplicates based on name
                              arr.findIndex((p: any) => 
                                `${p.firstName} ${p.lastName}` === `${person.firstName} ${person.lastName}`
                              ) === index
                            )
                            .map((person: any) => (
                              <SelectItem 
                                key={`${person.id}-${person.firstName}-${person.lastName}`} 
                                value={`${person.firstName} ${person.lastName}`}
                              >
                                {person.firstName} {person.lastName} ({person.type === 'player' ? 'Player' : person.role}){person.house && ` - ${person.house}`}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableDeliveryDates.map((delivery) => (
                          <SelectItem 
                            key={delivery.date} 
                            value={delivery.date}
                            disabled={delivery.isPastDeadline}
                          >
                            <div className="flex flex-col">
                              <span className={delivery.isPastDeadline ? 'text-gray-400' : ''}>
                                {delivery.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {delivery.isPastDeadline ? 'Deadline passed' : `Order until: ${delivery.deadline}`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
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
                  Food Budget: €{totalCost.toFixed(2)} / €35.00
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                              {item.category !== 'household' && (
                                <div className="text-xs text-gray-500">€{item.price.toFixed(2)}</div>
                              )}
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

            {/* Order limit warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-800 font-medium">⚠️ Food Budget Limit: €35.00 maximum (household items excluded)</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Current food budget: €{totalCost.toFixed(2)}
                {totalCost > 35 && " - Please reduce your food selection to proceed"}
              </p>
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
                disabled={createOrderMutation.isPending || totalCost > 35}
                className={`${totalCost > 35 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#DC143C] hover:bg-[#B91C3C]'}`}
              >
                {createOrderMutation.isPending ? "Submitting..." : 
                 totalCost > 35 ? `Over Limit (€${totalCost.toFixed(2)})` :
                 `Submit Order (€${totalCost.toFixed(2)})`}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}