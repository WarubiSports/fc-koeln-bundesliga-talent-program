import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Chore } from "@shared/schema";

interface ChoresListProps {
  onAddChore: () => void;
}

export default function ChoresList({ onAddChore }: ChoresListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();

  const { data: chores, isLoading } = useQuery<Chore[]>({
    queryKey: ["/api/chores"],
  });

  const updateChoreMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Chore> }) => {
      await apiRequest("PUT", `/api/chores/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chores/stats"] });
      toast({ description: "Chore updated successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        description: "Failed to update chore" 
      });
    },
  });

  const deleteChoreMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/chores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chores/stats"] });
      toast({ description: "Chore deleted successfully" });
    },
    onError: () => {
      toast({ 
        variant: "destructive",
        description: "Failed to delete chore" 
      });
    },
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "cleaning":
        return "bg-blue-100 text-blue-800";
      case "trash":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-purple-100 text-purple-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "cleaning":
        return "fas fa-broom";
      case "trash":
        return "fas fa-trash";
      case "maintenance":
        return "fas fa-tools";
      case "other":
        return "fas fa-tasks";
      default:
        return "fas fa-tasks";
    }
  };

  const handleStatusChange = (choreId: number, newStatus: string) => {
    updateChoreMutation.mutate({ 
      id: choreId, 
      updates: { status: newStatus as "pending" | "in_progress" | "completed" }
    });
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const filteredChores = chores?.filter(chore => {
    const matchesSearch = !searchQuery || 
      chore.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chore.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chore.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" || chore.category === categoryFilter;
    const matchesStatus = !statusFilter || statusFilter === "all" || chore.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-bold text-fc-dark">House Chores</h2>
            <p className="text-gray-600">Manage household tasks and responsibilities</p>
          </div>
          <Button
            onClick={onAddChore}
            className="bg-fc-red hover:bg-red-700"
          >
            <i className="fas fa-plus mr-2"></i>Add Chore
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            <Input
              type="text"
              placeholder="Search chores..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="trash">Trash</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Chores Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filteredChores || filteredChores.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            {searchQuery || (categoryFilter && categoryFilter !== "all") || (statusFilter && statusFilter !== "all")
              ? "No chores found matching your criteria."
              : "No chores added yet. Add your first chore to get started."
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChores.map((chore) => (
              <Card key={chore.id} className={`border ${isOverdue(chore.dueDate) && chore.status !== "completed" ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 ${getCategoryColor(chore.category)} rounded-lg flex items-center justify-center`}>
                        <i className={`${getCategoryIcon(chore.category)} text-sm`}></i>
                      </div>
                      <Badge className={getPriorityColor(chore.priority)}>
                        {chore.priority}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <button 
                        className="text-gray-600 hover:text-gray-800"
                        onClick={() => deleteChoreMutation.mutate(chore.id)}
                        disabled={deleteChoreMutation.isPending}
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{chore.title}</h3>
                  {chore.description && (
                    <p className="text-sm text-gray-600 mb-3">{chore.description}</p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <Badge className={getCategoryColor(chore.category)}>
                        {chore.category.charAt(0).toUpperCase() + chore.category.slice(1)}
                      </Badge>
                    </div>
                    
                    {chore.assignedTo && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Assigned to:</span>
                        <span className="font-medium">{chore.assignedTo}</span>
                      </div>
                    )}

                    {chore.dueDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due:</span>
                        <span className={`font-medium ${isOverdue(chore.dueDate) && chore.status !== "completed" ? "text-red-600" : ""}`}>
                          {new Date(chore.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="font-medium capitalize">{chore.frequency}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(chore.status)}>
                      {chore.status === "in_progress" ? "In Progress" : chore.status.charAt(0).toUpperCase() + chore.status.slice(1)}
                    </Badge>
                    <div className="flex space-x-2">
                      {chore.status === "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(chore.id, "in_progress")}
                          disabled={updateChoreMutation.isPending}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Start
                        </Button>
                      )}
                      {chore.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(chore.id, "completed")}
                          disabled={updateChoreMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete
                        </Button>
                      )}
                      {chore.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(chore.id, "pending")}
                          disabled={updateChoreMutation.isPending}
                          className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}