import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterNationality, setFilterNationality] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    position: "",
    status: "active",
    notes: ""
  });

  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading } = useQuery({
    queryKey: ["/api/players", { search: searchQuery, position: filterPosition, nationality: filterNationality, status: filterStatus }],
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (playerData: any) => {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerData)
      });
      if (!response.ok) throw new Error('Failed to add player');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setIsAddPlayerOpen(false);
      setNewPlayer({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        nationality: "",
        position: "",
        status: "active",
        notes: ""
      });
      toast({
        title: "Player added",
        description: "New player has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add player",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayerMutation.mutate(newPlayer);
  };

  const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper"];
  const nationalities = ["Germany", "England", "France", "Spain", "Italy", "Netherlands", "Brazil", "Argentina"];
  const statuses = ["active", "injured", "suspended", "on_loan"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "injured": return "bg-red-100 text-red-800";
      case "suspended": return "bg-yellow-100 text-yellow-800";
      case "on_loan": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Players</h1>
              <p className="text-gray-600">Manage the International Talent Program roster</p>
            </div>
            
            {isAdmin && (
              <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-fc-red hover:bg-fc-red/90 text-white">
                    <i className="fas fa-plus mr-2"></i>
                    Add Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Player</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddPlayer} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={newPlayer.firstName}
                          onChange={(e) => setNewPlayer(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newPlayer.lastName}
                          onChange={(e) => setNewPlayer(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newPlayer.email}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={newPlayer.dateOfBirth}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        <Select value={newPlayer.nationality} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, nationality: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            {nationalities.map(nationality => (
                              <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Select value={newPlayer.position} onValueChange={(value) => setNewPlayer(prev => ({ ...prev, position: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map(position => (
                              <SelectItem key={position} value={position}>{position}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddPlayerOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={addPlayerMutation.isPending} className="bg-fc-red hover:bg-fc-red/90 text-white">
                        Add Player
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Select value={filterPosition} onValueChange={setFilterPosition}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Positions</SelectItem>
              {positions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterNationality} onValueChange={setFilterNationality}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by nationality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Nationalities</SelectItem>
              {nationalities.map(nationality => (
                <SelectItem key={nationality} value={nationality}>{nationality}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>{status.replace('_', ' ').toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Players Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading players...</div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
            <p className="text-gray-500">
              {searchQuery || filterPosition || filterNationality || filterStatus 
                ? "Try adjusting your filters" 
                : "Add players to get started"
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player: any) => (
              <Card key={player.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{player.firstName} {player.lastName}</CardTitle>
                      <p className="text-sm text-gray-600">{player.email}</p>
                    </div>
                    <Badge className={getStatusColor(player.status)}>
                      {player.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Position:</span>
                      <span className="font-medium">{player.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nationality:</span>
                      <span className="font-medium">{player.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date of Birth:</span>
                      <span className="font-medium">{new Date(player.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    {player.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">{player.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}