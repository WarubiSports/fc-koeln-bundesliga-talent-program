import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-token-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Home, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Truck,
  Users,
  Calendar,
  Euro
} from "lucide-react";

interface HouseSummary {
  totalOrders: number;
  players: string[];
  orderDetails: Array<{
    id: number;
    playerName: string;
    weekStartDate: string;
    deliveryDay: string;
    status: string;
    estimatedCost: string;
    proteins?: string;
    vegetables?: string;
    fruits?: string;
    grains?: string;
    snacks?: string;
    beverages?: string;
    supplements?: string;
    specialRequests?: string;
    dietaryRestrictions?: string;
    adminNotes?: string;
  }>;
  consolidatedItems: {
    proteins: string[];
    vegetables: string[];
    fruits: string[];
    grains: string[];
    snacks: string[];
    beverages: string[];
    supplements: string[];
  };
}

export default function HouseOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dateFilter, setDateFilter] = useState("current-week");
  const isAdmin = user?.role === "admin" || user?.role === "coach";

  const { data: houseSummaries, isLoading, refetch } = useQuery<Record<string, HouseSummary>>({
    queryKey: ["/api/house-order-summary", dateFilter],
    queryFn: () => 
      fetch(`/api/house-order-summary?dateFilter=${dateFilter}`)
        .then(res => res.json())
  });

  const bulkConfirmMutation = useMutation({
    mutationFn: async ({ houseName, weekStartDate }: { houseName: string; weekStartDate: string }) => {
      return apiRequest("/api/house-orders/confirm", "PATCH", { houseName, weekStartDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/house-order-summary"] });
      toast({
        title: "Success",
        description: "All house orders confirmed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm orders",
        variant: "destructive",
      });
    },
  });

  const bulkCancelMutation = useMutation({
    mutationFn: async ({ houseName, weekStartDate, reason }: { houseName: string; weekStartDate: string; reason: string }) => {
      return apiRequest("/api/house-orders/cancel", "PATCH", { houseName, weekStartDate, reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/house-order-summary"] });
      toast({
        title: "Success",
        description: "House orders cancelled successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel orders",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'delivered':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatItems = (items: string[]) => {
    if (!items || items.length === 0) return "None";
    return items.join(", ");
  };

  const calculateTotalCost = (orders: HouseSummary['orderDetails']) => {
    return orders.reduce((total, order) => {
      return total + parseFloat(order.estimatedCost || "0");
    }, 0).toFixed(2);
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-gray-600">Only administrators and coaches can view house order summaries.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading house order summaries...</div>
      </div>
    );
  }

  const houses = Object.keys(houseSummaries || {});

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8 text-fc-red" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">House Orders Summary</h1>
            <p className="text-gray-600">Manage grocery orders by house and delivery schedule</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-week">Current Week</SelectItem>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => refetch()} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {houses.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
              <p className="text-gray-600">No grocery orders found for the selected time period.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {houses.map((houseName) => {
            const houseSummary = houseSummaries![houseName];
            const weeklyGroups = houseSummary.orderDetails.reduce((groups, order) => {
              const week = order.weekStartDate;
              if (!groups[week]) {
                groups[week] = [];
              }
              groups[week].push(order);
              return groups;
            }, {} as Record<string, typeof houseSummary.orderDetails>);

            return (
              <Card key={houseName}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-fc-red" />
                      {houseName}
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {houseSummary.totalOrders} orders
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        €{calculateTotalCost(houseSummary.orderDetails)}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Consolidated Shopping List */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Consolidated Shopping List
                    </h4>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Proteins</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.proteins)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Vegetables</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.vegetables)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Fruits</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.fruits)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Grains</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.grains)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Snacks</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.snacks)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Beverages</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.beverages)}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-1">Supplements</h5>
                        <p className="text-sm">{formatItems(houseSummary.consolidatedItems.supplements)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Orders by Week */}
                  {Object.entries(weeklyGroups).map(([weekStart, weekOrders]) => (
                    <div key={weekStart} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <h4 className="font-semibold">Week of {new Date(weekStart).toLocaleDateString()}</h4>
                          <Badge variant="secondary">{weekOrders.length} orders</Badge>
                        </div>
                        
                        {weekOrders.some(order => order.status === 'pending') && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => bulkConfirmMutation.mutate({ houseName, weekStartDate: weekStart })}
                              disabled={bulkConfirmMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm All
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => bulkCancelMutation.mutate({ 
                                houseName, 
                                weekStartDate: weekStart, 
                                reason: "Bulk cancellation" 
                              })}
                              disabled={bulkCancelMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel All
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid gap-3">
                        {weekOrders.map((order) => (
                          <div key={order.id} className="flex items-center justify-between p-3 bg-white border rounded">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(order.status)}
                              <div>
                                <h5 className="font-medium">{order.playerName}</h5>
                                <p className="text-sm text-gray-600 capitalize">
                                  {order.deliveryDay} delivery • €{order.estimatedCost}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(order.status)} variant="secondary">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Player Summary */}
                  <div className="text-sm text-gray-600">
                    <strong>Players in this house:</strong> {houseSummary.players.join(", ")}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}