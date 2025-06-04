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

  const [filterAgeRange, setFilterAgeRange] = useState("");
  const [filterHouse, setFilterHouse] = useState("");

  // Fetch players
  const { data: players = [], isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Enhanced filtering logic
  const filteredPlayers = useMemo(() => {
    return players.filter((player: Player) => {
      // Calculate age for filtering
      const playerAge = player.dateOfBirth ? calculateAge(player.dateOfBirth) : 0;
      
      // Search query filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchLower);
        const matchesEmail = player.email.toLowerCase().includes(searchLower);
        const matchesNationality = player.nationality.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesEmail && !matchesNationality) return false;
      }

      // Position filter
      if (filterPosition && filterPosition !== 'all') {
        const playerPositions = player.positions ? 
          (Array.isArray(player.positions) ? player.positions : [player.position]) : 
          [player.position];
        if (!playerPositions.includes(filterPosition)) return false;
      }

      // Nationality filter
      if (filterNationality && filterNationality !== 'all' && player.nationality !== filterNationality) return false;

      // Status filter
      if (filterStatus && filterStatus !== 'all' && player.status !== filterStatus) return false;

      // Age filter (individual ages 15-21)
      if (filterAgeRange && filterAgeRange !== 'all') {
        const targetAge = parseInt(filterAgeRange);
        if (playerAge !== targetAge) return false;
      }

      // House filter
      if (filterHouse && filterHouse !== 'all' && player.house !== filterHouse) return false;

      return true;
    });
  }, [players, searchQuery, filterPosition, filterNationality, filterStatus, filterAgeRange, filterHouse]);

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
          {/* Enhanced Filter Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Position Filter */}
                <Select value={filterPosition} onValueChange={setFilterPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Positions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {Object.entries(POSITION_DISPLAY_NAMES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>



                {/* Age Filter */}
                <Select value={filterAgeRange} onValueChange={setFilterAgeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Ages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="15">15 years</SelectItem>
                    <SelectItem value="16">16 years</SelectItem>
                    <SelectItem value="17">17 years</SelectItem>
                    <SelectItem value="18">18 years</SelectItem>
                    <SelectItem value="19">19 years</SelectItem>
                    <SelectItem value="20">20 years</SelectItem>
                    <SelectItem value="21">21 years</SelectItem>
                  </SelectContent>
                </Select>

                {/* House Filter */}
                <Select value={filterHouse} onValueChange={setFilterHouse}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Houses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Houses</SelectItem>
                    <SelectItem value="Widdersdorf 1">Widdersdorf 1</SelectItem>
                    <SelectItem value="Widdersdorf 2">Widdersdorf 2</SelectItem>
                    <SelectItem value="Widdersdorf 3">Widdersdorf 3</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_trial">On Trial</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Nationality Filter */}
                <Select value={filterNationality} onValueChange={setFilterNationality}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Nationalities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Nationalities</SelectItem>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        {getCountryFlag(country.code)} {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilterPosition("all");
                    setFilterNationality("all");
                    setFilterStatus("all");

                    setFilterAgeRange("all");
                    setFilterHouse("all");
                  }}
                  className="col-span-1"
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Players Directory ({filteredPlayers.length})
                </span>
                {isAdmin && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                )}
              </CardTitle>
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
                  {filteredPlayers.map((player: any) => {
                    const playerAge = player.dateOfBirth ? calculateAge(player.dateOfBirth) : player.age || 'N/A';
                    const playerPositions = player.positions ? 
                      (Array.isArray(player.positions) ? player.positions : [player.position]) : 
                      [player.position];
                    const countryFlag = player.nationalityCode ? getCountryFlag(player.nationalityCode) : getCountryFlag('');
                    // Remove availability color reference
                    
                    return (
                      <Card key={player.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0">
                                {player.profileImageUrl ? (
                                  <img 
                                    src={player.profileImageUrl} 
                                    alt={`${player.firstName} ${player.lastName}`}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600 font-semibold text-lg">
                                      {player.firstName?.charAt(0) || 'P'}{player.lastName?.charAt(0) || ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {player.firstName} {player.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {POSITION_DISPLAY_NAMES[player.position as keyof typeof POSITION_DISPLAY_NAMES] || player.position}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {player.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Age:</span>
                              <span>{playerAge}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Nationality:</span>
                              <span className="flex items-center gap-1">
                                <span className="text-lg">{countryFlag}</span>
                                {player.nationality}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">House:</span>
                              <span>{player.house}</span>
                            </div>
                            {playerPositions.length > 1 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Positions:</span>
                                <div className="flex flex-wrap gap-1">
                                  {playerPositions.map((pos: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {POSITION_DISPLAY_NAMES[pos as keyof typeof POSITION_DISPLAY_NAMES] || pos}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}