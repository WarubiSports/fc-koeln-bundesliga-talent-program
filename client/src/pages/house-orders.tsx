import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Package, ShoppingCart } from "lucide-react";

export default function HouseOrders() {
  const { data: houseOrderSummary, isLoading } = useQuery({
    queryKey: ["/api/house-order-summary"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">House Order Summary</h1>
          <p className="text-gray-600">Loading consolidated orders by house...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const houses = houseOrderSummary ? Object.keys(houseOrderSummary) : [];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">House Order Summary</h1>
        <p className="text-gray-600">Consolidated grocery and food orders by Widdersdorf house</p>
      </div>

      {houses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No food orders have been placed yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {houses.map((house) => {
            const houseData = houseOrderSummary[house];
            return (
              <Card key={house} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-[#DC143C]">
                      {house}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-[#DC143C]/10 text-[#DC143C]">
                      {houseData.totalOrders} orders
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Players in this house */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">Players ({houseData.players.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {houseData.players.map((player, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {player}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Consolidated Items */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">Consolidated Items</span>
                    </div>

                    <Tabs defaultValue="proteins" className="w-full">
                      <TabsList className="grid w-full grid-cols-4 text-xs">
                        <TabsTrigger value="proteins">Proteins</TabsTrigger>
                        <TabsTrigger value="vegetables">Veggies</TabsTrigger>
                        <TabsTrigger value="grains">Grains</TabsTrigger>
                        <TabsTrigger value="beverages">Drinks</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="proteins" className="mt-2">
                        <div className="space-y-1">
                          {houseData.consolidatedItems.proteins.length > 0 ? (
                            houseData.consolidatedItems.proteins.map((item, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {item}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No proteins ordered</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="vegetables" className="mt-2">
                        <div className="space-y-1">
                          {houseData.consolidatedItems.vegetables.length > 0 ? (
                            houseData.consolidatedItems.vegetables.map((item, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {item}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No vegetables ordered</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="grains" className="mt-2">
                        <div className="space-y-1">
                          {houseData.consolidatedItems.grains.length > 0 ? (
                            houseData.consolidatedItems.grains.map((item, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {item}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No grains ordered</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="beverages" className="mt-2">
                        <div className="space-y-1">
                          {houseData.consolidatedItems.beverages.length > 0 ? (
                            houseData.consolidatedItems.beverages.map((item, index) => (
                              <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                                {item}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No beverages ordered</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Order Details Summary */}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">Recent Orders</span>
                    </div>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {houseData.orderDetails.slice(0, 5).map((order, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
                          <span>{order.playerName}</span>
                          <span className="text-gray-500">{order.weekStartDate}</span>
                        </div>
                      ))}
                      {houseData.orderDetails.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{houseData.orderDetails.length - 5} more orders
                        </p>
                      )}
                    </div>
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