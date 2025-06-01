import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChefHat, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FoodOrder } from "@shared/schema";
import FoodOrderModal from "@/components/food-order-modal";

export default function FoodOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/food-orders"],
    enabled: isAuthenticated,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/food-order-stats"],
    enabled: isAuthenticated,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest(`/api/food-orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🥐";
      case "lunch":
        return "🍽️";
      case "dinner":
        return "🍲";
      default:
        return "🍴";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-6 text-center">
          <CardContent>
            <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Required</h3>
            <p className="text-gray-600 mb-4">Please log in to access the food ordering system.</p>
            <Button onClick={() => window.location.href = '/api/login'}>
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Food Orders</h1>
          <p className="text-gray-600">Manage meal orders for FC Köln players</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Food Order
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-5 w-5 text-[#DC143C]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmedOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelledOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Food Orders List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChefHat className="h-5 w-5" />
            <span>Recent Food Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <ChefHat className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">No food orders yet. Create your first order to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order: FoodOrder) => (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getMealTypeIcon(order.mealType)}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{order.playerName}</h3>
                        <p className="text-sm text-gray-600">
                          {order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1)} • {order.orderDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                      {user?.email?.includes('@fckoeln.de') && order.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'confirmed' })}
                            className="border-green-200 text-green-700 hover:bg-green-50"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateOrderMutation.mutate({ id: order.id, status: 'cancelled' })}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Main Dish</p>
                      <p className="font-medium">{order.mainDish || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Side Dish</p>
                      <p className="font-medium">{order.sideDish || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Drink</p>
                      <p className="font-medium">{order.drink || "Not specified"}</p>
                    </div>
                  </div>

                  {order.specialRequests && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-gray-600 text-sm">Special Requests</p>
                      <p className="text-sm">{order.specialRequests}</p>
                    </div>
                  )}

                  {order.allergies && (
                    <div className="mt-2">
                      <p className="text-red-600 text-sm font-medium">Allergies: {order.allergies}</p>
                    </div>
                  )}

                  {order.estimatedCost && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Estimated Cost: <span className="font-medium">€{order.estimatedCost}</span></p>
                    </div>
                  )}

                  {order.deliveryTime && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Delivery Time: <span className="font-medium">{order.deliveryTime}</span></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Order Modal */}
      <FoodOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </div>
  );
}