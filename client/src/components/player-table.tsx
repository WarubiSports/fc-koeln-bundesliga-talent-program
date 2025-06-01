import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player } from "@shared/schema";

interface PlayerTableProps {
  onAddPlayer: () => void;
}

export default function PlayerTable({ onAddPlayer }: PlayerTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const [countryFilter, setCountryFilter] = useState("");
  const { toast } = useToast();

  // Build query params
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.set("search", searchQuery);
  if (positionFilter && positionFilter !== "all") queryParams.set("position", positionFilter);

  if (countryFilter && countryFilter !== "all") queryParams.set("nationality", countryFilter);

  const { data: players, isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players", queryParams.toString()],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/players/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ description: "Player deleted successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        description: "Failed to delete player" 
      });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/players/export", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "players.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({ description: "Player data exported successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        description: "Failed to export player data" 
      });
    },
  });

  const getPositionColor = (position: string) => {
    switch (position) {
      case "goalkeeper":
        return "bg-purple-100 text-purple-800";
      case "defender":
        return "bg-green-100 text-green-800";
      case "midfielder":
        return "bg-blue-100 text-blue-800";
      case "forward":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on_trial":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCountryFlag = (nationality: string) => {
    const flags: { [key: string]: string } = {
      germany: "🇩🇪",
      brazil: "🇧🇷",
      france: "🇫🇷",
      spain: "🇪🇸",
      italy: "🇮🇹",
      portugal: "🇵🇹",
      england: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      netherlands: "🇳🇱",
    };
    return flags[nationality.toLowerCase()] || "🌍";
  };



  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-fc-dark">Player Roster</h2>
            <p className="text-gray-600">Manage and organize your international talent</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              className="text-fc-red border-fc-red hover:bg-fc-red hover:text-white"
            >
              <i className="fas fa-download mr-2"></i>
              {exportMutation.isPending ? "Exporting..." : "Export"}
            </Button>
            <Button
              onClick={onAddPlayer}
              className="bg-fc-red hover:bg-red-700"
            >
              <i className="fas fa-plus mr-2"></i>Add Player
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <Input
              type="text"
              placeholder="Search players..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="goalkeeper">Goalkeeper</SelectItem>
              <SelectItem value="defender">Defender</SelectItem>
              <SelectItem value="midfielder">Midfielder</SelectItem>
              <SelectItem value="forward">Forward</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Age Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Age Groups</SelectItem>
              <SelectItem value="u16">Under 16</SelectItem>
              <SelectItem value="u18">Under 18</SelectItem>
              <SelectItem value="u21">Under 21</SelectItem>
            </SelectContent>
          </Select>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="germany">Germany</SelectItem>
              <SelectItem value="brazil">Brazil</SelectItem>
              <SelectItem value="france">France</SelectItem>
              <SelectItem value="spain">Spain</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Player Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : !players || players.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery || (positionFilter && positionFilter !== "all") || (countryFilter && countryFilter !== "all")
              ? "No players found matching your criteria."
              : "No players registered yet. Add your first player to get started."
            }
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {player.firstName} {player.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{player.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getPositionColor(player.position)}>
                      {player.position.charAt(0).toUpperCase() + player.position.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.ageGroup.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">
                        {player.nationality.charAt(0).toUpperCase() + player.nationality.slice(1)}
                      </span>
                      <span className="ml-2 text-lg">{getCountryFlag(player.nationality)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(player.status)}>
                      {player.status === "on_trial" ? "On Trial" : player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-fc-red hover:text-red-700">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => deleteMutation.mutate(player.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {players && players.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">{Math.min(10, players.length)}</span> of{" "}
              <span className="font-medium">{players.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" disabled>
                Previous
              </Button>
              <Button size="sm" className="bg-fc-red text-white">
                1
              </Button>
              <Button size="sm" variant="outline" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
