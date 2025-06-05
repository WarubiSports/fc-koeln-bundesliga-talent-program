import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ShoppingCart, TrendingUp, Check, X, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { FoodOrder } from "@shared/schema";
import GroceryOrderModal from "@/components/grocery-order-modal";

export default function GroceryOrdersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<string>();
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<FoodOrder[]>({
    queryKey: ["/api/food-orders"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/food-order-stats"],
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"],
  });

  // Query for house order summaries (admin only)
  const { data: houseOrderSummary = {} } = useQuery({
    queryKey: ["/api/house-order-summary"],
    enabled: isAdmin,
  });

  // Order status management mutations (admin/staff only)
  const confirmOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest(`/api/food-orders/${orderId}/confirm`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Order confirmed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to confirm order",
        variant: "destructive",
      });
    },
  });

  const completeOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest(`/api/food-orders/${orderId}/complete`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Order marked as delivered",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to complete order",
        variant: "destructive",
      });
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest(`/api/food-orders/${orderId}/cancel`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/food-order-stats"] });
      toast({
        title: "Success",
        description: "Order cancelled",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to cancel order",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grocery Orders</h1>
            <p className="text-gray-600">Manage weekly grocery orders for the houses</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.confirmedOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.deliveredOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* House Order Summary - Admin Only */}
      {isAdmin && Object.keys(houseOrderSummary).length > 0 && (
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>House Order Summary</CardTitle>
              <p className="text-sm text-gray-600">Consolidated grocery orders by house</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(houseOrderSummary).map(([houseName, houseData]: [string, any]) => (
                  <Card key={houseName} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{houseName}</span>
                        <Badge variant="outline">
                          {houseData.totalOrders} orders
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {houseData.players?.length || 0} players
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Players in this house */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Players:</h4>
                        <div className="flex flex-wrap gap-1">
                          {houseData.players?.map((player: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {player}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Consolidated Items */}
                      {houseData.consolidatedItems && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Consolidated Items:</h4>
                          
                          {Object.entries(houseData.consolidatedItems).map(([category, items]: [string, any]) => (
                            items?.length > 0 && (
                              <div key={category} className="space-y-1">
                                <h5 className="text-xs font-medium text-gray-600 capitalize">
                                  {category}:
                                </h5>
                                <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                  {Array.isArray(items) ? items.join(', ') : items}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Recent Orders for this house */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Recent Orders:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {houseData.orderDetails?.slice(0, 3).map((order: any, index: number) => (
                            <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{order.playerName}</span>
                                <Badge variant="outline" className="text-xs">
                                  {order.status}
                                </Badge>
                              </div>
                              <div className="text-gray-600 mt-1">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                          {houseData.orderDetails?.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{houseData.orderDetails.length - 3} more orders
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>House Orders Summary</CardTitle>
          <p className="text-sm text-gray-600">Consolidated grocery orders organized by house</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : Object.keys(houseOrderSummary).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders found. Create your first grocery order!
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(houseOrderSummary).map(([houseName, houseData]: [string, any]) => (
                <Card key={houseName} className="border-l-4 border-l-[#DC143C]">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg text-[#DC143C]">{houseName}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {houseData.players?.length || 0} players • {houseData.totalOrders} orders this week
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {houseData.orderDetails?.some((order: any) => order.status === 'pending') && (
                          <Badge variant="outline" className="text-orange-600 border-orange-600">
                            Pending Orders
                          </Badge>
                        )}
                        {houseData.orderDetails?.some((order: any) => order.status === 'confirmed') && (
                          <Badge variant="secondary" className="text-blue-600">
                            Confirmed Orders
                          </Badge>
                        )}
                        {houseData.orderDetails?.some((order: any) => order.status === 'delivered') && (
                          <Badge variant="default" className="bg-green-600">
                            Delivered Orders
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Players in this house */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Players in House:</h4>
                      <div className="flex flex-wrap gap-2">
                        {houseData.players?.map((player: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {player}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Consolidated Shopping List */}
                    {houseData.consolidatedItems && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Consolidated Shopping List:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(houseData.consolidatedItems).map(([category, items]: [string, any]) => (
                            items?.length > 0 && (
                              <div key={category} className="bg-gray-50 p-3 rounded-lg">
                                <h5 className="text-xs font-semibold text-gray-700 uppercase mb-2">
                                  {category.replace(/([A-Z])/g, ' $1').trim()}
                                </h5>
                                <div className="text-sm text-gray-800">
                                  {Array.isArray(items) ? items.join(', ') : items}
                                </div>
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Orders for Admin Management */}
                    {(user?.role === 'admin' || user?.role === 'staff') && houseData.orderDetails && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">Individual Orders Management:</h4>
                        <div className="space-y-2">
                          {houseData.orderDetails.map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <p className="font-medium text-sm">{order.playerName}</p>
                                    <p className="text-xs text-gray-500">
                                      Week: {order.weekStartDate} • Delivery: {order.deliveryDay}
                                    </p>
                                    <p className="text-xs text-gray-600">Cost: €{order.estimatedCost}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={
                                  order.status === 'delivered' ? 'default' :
                                  order.status === 'confirmed' ? 'secondary' :
                                  order.status === 'pending' ? 'outline' : 'destructive'
                                }>
                                  {order.status}
                                </Badge>
                                
                                {/* Admin Action Buttons */}
                                <div className="flex items-center gap-1">
                                  {order.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => confirmOrderMutation.mutate(order.id)}
                                        disabled={confirmOrderMutation.isPending}
                                        className="flex items-center gap-1 text-xs px-2 py-1"
                                      >
                                        <Clock className="h-3 w-3" />
                                        Confirm
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => cancelOrderMutation.mutate(order.id)}
                                        disabled={cancelOrderMutation.isPending}
                                        className="flex items-center gap-1 text-xs px-2 py-1"
                                      >
                                        <X className="h-3 w-3" />
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  
                                  {order.status === 'confirmed' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => completeOrderMutation.mutate(order.id)}
                                        disabled={completeOrderMutation.isPending}
                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                                      >
                                        <Check className="h-3 w-3" />
                                        Deliver
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => cancelOrderMutation.mutate(order.id)}
                                        disabled={cancelOrderMutation.isPending}
                                        className="flex items-center gap-1 text-xs px-2 py-1"
                                      >
                                        <X className="h-3 w-3" />
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  
                                  {order.status === 'delivered' && (
                                    <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
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

      <GroceryOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        players={players}
        selectedWeek={selectedWeek}
      />
    </div>
  );
}