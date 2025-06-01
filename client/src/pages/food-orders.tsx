import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FoodOrder } from "@shared/schema";
import GroceryOrderModal from "@/components/grocery-order-modal";

export default function GroceryOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/food-orders"],
    enabled: isAuthenticated,
  });

  const { data: stats = {} } = useQuery({
    queryKey: ["/api/food-order-stats"],
    enabled: isAuthenticated,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PUT", `/api/food-orders/${id}`, { status });
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
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateOrderMutation.mutate({ id, status });
  };

  const handleNewOrder = (week?: string) => {
    setSelectedWeek(week);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grocery Orders</h1>
          <p className="text-gray-600">Manage weekly grocery deliveries for FC Köln players</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Grocery Order
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).pendingOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).confirmedOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).deliveredOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats as any).cancelledOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Grocery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(orders) && orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No grocery orders yet</p>
              <Button
                onClick={() => handleNewOrder()}
                className="mt-4 bg-[#DC143C] hover:bg-[#B91C3C] text-white"
              >
                Create First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(orders) && orders.map((order: FoodOrder) => (
                <Card key={order.id} className="border-l-4 border-l-[#DC143C]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.playerName}</h3>
                          <p className="text-sm text-gray-600">
                            Week of {new Date(order.weekStartDate).toLocaleDateString()} • {order.deliveryDay}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </Badge>
                        {isAuthenticated && ((user as any)?.email?.endsWith('@fckoeln.de') || (user as any)?.email?.endsWith('@warubi-sports.com')) && order.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                              disabled={updateOrderMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              disabled={updateOrderMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grocery Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {order.proteins && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Proteins</h4>
                          <p className="text-sm text-gray-600">{order.proteins}</p>
                        </div>
                      )}
                      {order.vegetables && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Vegetables</h4>
                          <p className="text-sm text-gray-600">{order.vegetables}</p>
                        </div>
                      )}
                      {order.fruits && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Fruits</h4>
                          <p className="text-sm text-gray-600">{order.fruits}</p>
                        </div>
                      )}
                      {order.grains && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Grains</h4>
                          <p className="text-sm text-gray-600">{order.grains}</p>
                        </div>
                      )}
                      {order.snacks && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Snacks</h4>
                          <p className="text-sm text-gray-600">{order.snacks}</p>
                        </div>
                      )}
                      {order.beverages && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Beverages</h4>
                          <p className="text-sm text-gray-600">{order.beverages}</p>
                        </div>
                      )}
                      {order.supplements && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-1">Supplements</h4>
                          <p className="text-sm text-gray-600">{order.supplements}</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    {(order.dietaryRestrictions || order.estimatedCost || order.specialRequests) && (
                      <div className="border-t pt-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {order.dietaryRestrictions && (
                            <div>
                              <span className="font-medium text-gray-700">Dietary Restrictions:</span>
                              <p className="text-gray-600">{order.dietaryRestrictions}</p>
                            </div>
                          )}
                          {order.estimatedCost && (
                            <div>
                              <span className="font-medium text-gray-700">Estimated Cost:</span>
                              <p className="text-gray-600">€{order.estimatedCost}</p>
                            </div>
                          )}
                          {order.specialRequests && (
                            <div>
                              <span className="font-medium text-gray-700">Special Requests:</span>
                              <p className="text-gray-600">{order.specialRequests}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <GroceryOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedWeek={selectedWeek}
      />
    </div>
  );
}