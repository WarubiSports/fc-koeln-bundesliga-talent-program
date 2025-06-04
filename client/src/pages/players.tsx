import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, CheckCircle, XCircle, Clock, Users, UserX, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCountryFlag, calculateAge, COUNTRIES, POSITION_DISPLAY_NAMES, AVAILABILITY_COLORS } from "@/lib/country-flags";
import type { Player } from "@shared/schema";

export default function Players() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [filterHouse, setFilterHouse] = useState("");

  // Fetch players
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Fetch pending users (admin only)
  const { data: pendingUsers = [], isLoading: pendingUsersLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/pending-users"],
    enabled: isAdmin,
  });

  const approveUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/approve-user/${userId}`, "PUT");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "User approved",
        description: "User has been approved and can now access the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Players & Staff</h1>
            <p className="text-gray-600">Manage players and staff approvals</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue={isAdmin ? "pending" : "players"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          {isAdmin && <TabsTrigger value="pending">Pending Approvals</TabsTrigger>}
          <TabsTrigger value="players">All Players</TabsTrigger>
        </TabsList>

        {isAdmin && (
          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending User Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsersLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending approvals
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUserMutation.mutate(user.id)}
                            disabled={approveUserMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="players" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Players Directory</CardTitle>
            </CardHeader>
            <CardContent>
              {playersLoading ? (
                <div className="text-center py-8">Loading players...</div>
              ) : players.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No players found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {players.map((player: any) => (
                    <Card key={player.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0">
                              {player.profileImageUrl ? (
                                <img 
                                  src={player.profileImageUrl} 
                                  alt={`${player.name}`}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                                  <span className="text-red-600 font-semibold text-lg">
                                    {player.name?.charAt(0) || 'P'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {player.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {player.position}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Age:</span>
                            <span>{player.age}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Nationality:</span>
                            <span>{player.nationality}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}