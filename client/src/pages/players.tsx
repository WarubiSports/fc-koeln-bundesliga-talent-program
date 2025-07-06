import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Filter, Users, UserX, AlertTriangle, Edit3, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCountryFlag, calculateAge, COUNTRIES, POSITION_DISPLAY_NAMES, AVAILABILITY_COLORS } from "@/lib/country-flags";
import type { Player } from "@shared/schema";

// Player edit form schema
const playerEditSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  nationalityCode: z.string().optional(),
  position: z.enum(["goalkeeper", "defender", "midfielder", "forward", "winger", "striker", "center-back", "fullback", "defensive-midfielder", "attacking-midfielder"]),
  positions: z.array(z.string()).min(1, "Select at least one position"),
  preferredFoot: z.enum(["left", "right", "both"]).default("right"),
  height: z.string().optional(),
  weight: z.string().optional(),
  previousClub: z.string().optional(),
  profileImageUrl: z.string().optional(),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  status: z.enum(["active", "on_trial", "inactive", "pending"]),
  house: z.enum(["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"]).optional(),
  jerseyNumber: z.string().optional(),
});

type PlayerEditFormData = z.infer<typeof playerEditSchema>;

export default function Players() {
  const { isAdmin, canManagePlayers } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

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



  // Player edit form
  const editForm = useForm<PlayerEditFormData>({
    resolver: zodResolver(playerEditSchema),
  });

  const updatePlayerMutation = useMutation({
    mutationFn: async (data: PlayerEditFormData & { id: number }) => {
      return await apiRequest(`/api/players/${data.id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player Updated",
        description: "Player profile has been successfully updated.",
      });
      setEditingPlayer(null);
      editForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      await apiRequest(`/api/admin/delete-player/${playerId}`, "DELETE");
    },
    onSuccess: (_, playerId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      const player = players.find(p => p.id === playerId);
      toast({
        title: "Player Deleted",
        description: `${player?.firstName} ${player?.lastName} has been permanently deleted.`,
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditPlayer = (player: any) => {
    setEditingPlayer(player);
    const playerPositions = player.positions ? 
      (Array.isArray(player.positions) ? player.positions : [player.position]) : 
      [player.position];
    setSelectedPositions(playerPositions);
    
    editForm.reset({
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      phone: player.phone || "",
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
      nationalityCode: player.nationalityCode || "",
      position: player.position,
      positions: playerPositions,
      preferredFoot: player.preferredFoot || "right",
      height: player.height?.toString() || "",
      weight: player.weight?.toString() || "",
      previousClub: player.previousClub || "",
      profileImageUrl: player.profileImageUrl || "",
      emergencyContactName: player.emergencyContactName || "",
      emergencyContactPhone: player.emergencyContactPhone || "",
      medicalConditions: player.medicalConditions || "",
      allergies: player.allergies || "",
      status: player.status,
      house: player.house,
      jerseyNumber: player.jerseyNumber?.toString() || "",
    });
  };

  const handlePositionChange = (position: string, checked: boolean) => {
    let newPositions = [...selectedPositions];
    if (checked) {
      newPositions.push(position);
    } else {
      newPositions = newPositions.filter(p => p !== position);
    }
    setSelectedPositions(newPositions);
    editForm.setValue("positions", newPositions);
    
    if (newPositions.length > 0 && Object.keys(POSITION_DISPLAY_NAMES).includes(newPositions[0])) {
      editForm.setValue("position", newPositions[0] as any);
    }
  };

  const handleNationalityChange = (nationality: string) => {
    const country = COUNTRIES.find(c => c.name === nationality);
    editForm.setValue("nationality", nationality);
    editForm.setValue("nationalityCode", country?.code || "");
  };

  const onEditSubmit = (data: PlayerEditFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Editing player:", editingPlayer);
    console.log("Form errors:", editForm.formState.errors);
    
    if (editingPlayer) {
      console.log("Calling mutation with:", { ...data, id: editingPlayer.id });
      updatePlayerMutation.mutate({ ...data, id: editingPlayer.id });
    }
  };

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

      <div className="space-y-6">
          {/* Enhanced Filter Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players Directory ({filteredPlayers.length})
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
                    // Get country flag using comprehensive mapping
                    const getCountryFlagFromName = (nationality: string, nationalityCode?: string) => {
                      // If we have a country code, use it directly
                      if (nationalityCode && nationalityCode.length === 2) {
                        return getCountryFlag(nationalityCode);
                      }
                      
                      // Handle special cases and variations
                      const countryNameMap: { [key: string]: string } = {
                        "united states": "US",
                        "usa": "US",
                        "america": "US",
                        "us": "US",
                        "england": "GB",
                        "united kingdom": "GB",
                        "uk": "GB",
                        "south korea": "KR",
                        "north korea": "KP",
                        "ivory coast": "CI",
                        "democratic republic of congo": "CD",
                        "congo": "CG",
                      };

                      const normalized = nationality.toLowerCase().trim();
                      
                      // Check for special mappings first
                      if (countryNameMap[normalized]) {
                        return getCountryFlag(countryNameMap[normalized]);
                      }
                      
                      // Find country by name in COUNTRIES array
                      const country = COUNTRIES.find(c => 
                        c.name.toLowerCase() === normalized
                      );
                      
                      if (country) {
                        return getCountryFlag(country.code);
                      }
                      
                      // If it's already a 2-letter code, use it directly
                      if (nationality.length === 2) {
                        return getCountryFlag(nationality.toUpperCase());
                      }
                      
                      // Default fallback
                      return "🌍";
                    };
                    
                    const countryFlag = getCountryFlagFromName(player.nationality, player.nationalityCode);
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {player.status}
                              </Badge>
                              {isAdmin && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleEditPlayer(player)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      if (window.confirm(`⚠️ DELETE ${player.firstName} ${player.lastName}?\n\nThis will permanently remove:\n• Player profile\n• All associated data\n\nCannot be undone!`)) {
                                        deletePlayerMutation.mutate(player.id);
                                      }
                                    }}
                                    disabled={deletePlayerMutation.isPending}
                                    className="h-6 w-6 p-0 bg-red-800 hover:bg-red-900"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
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
      </div>

      {/* Player Edit Modal */}
      <Dialog open={!!editingPlayer} onOpenChange={() => setEditingPlayer(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player Profile</DialogTitle>
          </DialogHeader>
          
          {editingPlayer && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="nationality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <Select value={field.value} onValueChange={handleNationalityChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {COUNTRIES.map((country) => (
                              <SelectItem key={country.code} value={country.name}>
                                {getCountryFlag(country.code)} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Admin Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_trial">On Trial</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="house"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Assignment</FormLabel>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select house" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Widdersdorf 1">Widdersdorf 1</SelectItem>
                            <SelectItem value="Widdersdorf 2">Widdersdorf 2</SelectItem>
                            <SelectItem value="Widdersdorf 3">Widdersdorf 3</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="jerseyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jersey Number</FormLabel>
                        <FormControl>
                          <Input placeholder="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Football Information */}
                <div className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="positions"
                    render={() => (
                      <FormItem>
                        <FormLabel>Playing Positions</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(POSITION_DISPLAY_NAMES).map(([value, label]) => (
                            <div key={value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`edit-${value}`}
                                checked={selectedPositions.includes(value)}
                                onCheckedChange={(checked) => handlePositionChange(value, !!checked)}
                              />
                              <label htmlFor={`edit-${value}`} className="text-sm">{label}</label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={editForm.control}
                      name="preferredFoot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Foot</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                              <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="previousClub"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Club</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="profileImageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Medical Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="medicalConditions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditingPlayer(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    disabled={updatePlayerMutation.isPending}
                    onClick={async () => {
                      console.log("Update button clicked");
                      console.log("Form state:", editForm.formState);
                      console.log("Form errors:", editForm.formState.errors);
                      console.log("Form values:", editForm.getValues());
                      
                      // Trigger form validation manually
                      const isValid = await editForm.trigger();
                      console.log("Form validation result:", isValid);
                      
                      if (isValid) {
                        // Submit the form manually
                        const formData = editForm.getValues();
                        console.log("Submitting form with data:", formData);
                        onEditSubmit(formData);
                      } else {
                        console.log("Form validation failed:", editForm.formState.errors);
                      }
                    }}
                  >
                    {updatePlayerMutation.isPending ? "Updating..." : "Update Player"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}