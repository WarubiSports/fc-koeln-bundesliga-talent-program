import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, User, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Chore } from "../../../shared/schema";

interface ChoresListProps {
  onAddChore: () => void;
}

export default function ChoresList({ onAddChore }: ChoresListProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'coach';
  const [selectedHouse, setSelectedHouse] = useState<string>("Widdersdorf 1");

  // Debug logging
  console.log("ChoresList - User:", user);
  console.log("ChoresList - User role:", user?.role);
  console.log("ChoresList - isAdmin:", isAdmin);

  const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];

  // For admins/coaches, use house filtering; for players, get their assigned chores
  const queryKey = isAdmin 
    ? [`/api/chores?house=${encodeURIComponent(selectedHouse)}`]
    : ['/api/chores'];

  const { data: chores, isLoading } = useQuery<Chore[]>({
    queryKey,
  });

  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/chores/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chore-stats"] });
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/chores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chore-stats"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fc-red mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading chores...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-fc-dark flex items-center">
            <i className="fas fa-tasks text-fc-red mr-3"></i>
            House Chores
          </CardTitle>
          {isAdmin && (
            <Button 
              onClick={onAddChore}
              className="bg-fc-red hover:bg-fc-red/90 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chore
            </Button>
          )}
        </div>
        <p className="text-gray-600">Manage tasks for each house location</p>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs value={selectedHouse} onValueChange={setSelectedHouse} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            {houses.map((house) => (
              <TabsTrigger key={house} value={house} className="text-sm">
                {house}
              </TabsTrigger>
            ))}
          </TabsList>

          {houses.map((house) => (
            <TabsContent key={house} value={house}>
              <div className="space-y-4">
                {chores && chores.length > 0 ? (
                  chores.map((chore) => (
                    <div
                      key={chore.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{chore.title}</h3>
                          {chore.description && (
                            <p className="text-gray-600 text-sm mb-2">{chore.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={getStatusColor(chore.status)}>
                              {chore.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(chore.priority)}>
                              {chore.priority} priority
                            </Badge>
                            <Badge variant="outline" className="text-gray-600">
                              {chore.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {chore.assignedTo && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {chore.assignedTo}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(chore.dueDate)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {chore.frequency}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {chore.status !== "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateChoreMutation.mutate({
                                  id: chore.id,
                                  status: chore.status === "pending" ? "in_progress" : "completed",
                                })
                              }
                              disabled={updateChoreMutation.isPending}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              {chore.status === "pending" ? "Start" : "Complete"}
                            </Button>
                          )}
                          {isAdmin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteChoreMutation.mutate(chore.id)}
                              disabled={deleteChoreMutation.isPending}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <i className="fas fa-clipboard-list text-4xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No chores for {house}</h3>
                    <p className="text-gray-600 mb-4">Get started by adding the first chore for this house.</p>
                    {isAdmin && (
                      <Button onClick={onAddChore} className="bg-fc-red hover:bg-fc-red/90 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Chore
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}