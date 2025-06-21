import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Home, Users, MapPin, Trophy, Brain } from "lucide-react";
import { HouseCompetitionLeaderboard } from "@/components/house-competition-leaderboard";
import { SmartChoreRotation } from "@/components/smart-chore-rotation";
import type { Player } from "../../../shared/schema";

const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];

export default function HouseManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin" || user?.role === "coach";

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const updatePlayerHouseMutation = useMutation({
    mutationFn: async ({ playerId, house }: { playerId: number; house: string }) => {
      return apiRequest(`/api/players/${playerId}`, "PUT", { house });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player house assignment updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update house assignment",
        variant: "destructive",
      });
    },
  });

  const getPlayersInHouse = (house: string) => {
    return players?.filter(player => player.house === house) || [];
  };

  const getUnassignedPlayers = () => {
    return players?.filter(player => !player.house || player.house === null) || [];
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Home className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
              <p className="text-gray-600">Only administrators and coaches can manage house assignments.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading house management...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Home className="h-8 w-8 text-fc-red" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">House Management</h1>
          <p className="text-gray-600">Advanced house management with smart chore rotation and competition tracking</p>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Player Assignments</TabsTrigger>
          <TabsTrigger value="competition">House Competition</TabsTrigger>
          <TabsTrigger value="rotation">Smart Chore Rotation</TabsTrigger>
          <TabsTrigger value="overview">House Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6">{renderAssignmentsContent()}</TabsContent>
        <TabsContent value="competition"><HouseCompetitionLeaderboard /></TabsContent>
        <TabsContent value="rotation"><SmartChoreRotation /></TabsContent>
        <TabsContent value="overview">{renderHouseOverview()}</TabsContent>
      </Tabs>
    </div>
  );

  function renderAssignmentsContent() {
    return (
      <>
        {/* Unassigned Players */}
        {getUnassignedPlayers().length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-600" />
                Unassigned Players ({getUnassignedPlayers().length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {getUnassignedPlayers().map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{player.firstName} {player.lastName}</h4>
                        <p className="text-sm text-gray-600">{player.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        onValueChange={(house) => 
                          updatePlayerHouseMutation.mutate({ playerId: player.id, house })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assign house" />
                        </SelectTrigger>
                        <SelectContent>
                          {houses.map((house) => (
                            <SelectItem key={house} value={house}>
                              {house}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* House Assignments */}
        <div className="grid gap-6">
          {houses.map((house) => (
            <Card key={house}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-5 w-5 text-fc-red" />
                    {house}
                  </div>
                  <Badge variant="outline">
                    {getPlayersInHouse(house).length} players
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {getPlayersInHouse(house).map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-fc-red/10 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-fc-red" />
                        </div>
                        <div>
                          <h5 className="font-medium">{player.firstName} {player.lastName}</h5>
                          <p className="text-sm text-gray-600">{player.position} • {player.nationality}</p>
                        </div>
                      </div>
                      <Select
                        value={player.house || ""}
                        onValueChange={(newHouse) => 
                          updatePlayerHouseMutation.mutate({ playerId: player.id, house: newHouse })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {houses.map((houseOption) => (
                            <SelectItem key={houseOption} value={houseOption}>
                              {houseOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                  
                  {getPlayersInHouse(house).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No players assigned to this house
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  function renderHouseOverview() {
    return (
      <div className="grid gap-6">
        {houses.map((house) => {
          const housePlayers = getPlayersInHouse(house);
          return (
            <Card key={house}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-fc-red" />
                  {house}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-fc-red">{housePlayers.length}</div>
                    <div className="text-sm text-gray-600">Players</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-fc-red">
                      {new Set(housePlayers.map(p => p.nationality)).size}
                    </div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-fc-red">
                      {Math.round((housePlayers.filter(p => p.status === 'active').length / Math.max(housePlayers.length, 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Active Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
}