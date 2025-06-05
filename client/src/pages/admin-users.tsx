import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Check, X, Users, Clock, Mail, User, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCountryFlag } from "@/lib/country-flags";

interface PendingUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  nationality?: string;
  position?: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  const { data: pendingUsers = [], isLoading } = useQuery<PendingUser[]>({
    queryKey: ["/api/admin/pending-users"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: userStats = {} } = useQuery<{
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    activePlayers: number;
  }>({
    queryKey: ["/api/admin/user-stats"],
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/approve-user/${userId}`, "POST");
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      const user = pendingUsers.find(u => u.id === userId);
      toast({
        title: "User Approved",
        description: `${user?.firstName} ${user?.lastName} has been approved and can now access the application.`,
      });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/reject-user/${userId}`, "POST");
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      
      const user = pendingUsers.find((u: PendingUser) => u.id === userId);
      toast({
        title: "User Rejected",
        description: `${user?.firstName} ${user?.lastName}'s registration has been rejected.`,
      });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/delete-user/${userId}`, "DELETE");
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      const user = pendingUsers.find(u => u.id === userId);
      toast({
        title: "User Deleted",
        description: `${user?.firstName} ${user?.lastName} has been permanently deleted.`,
        variant: "destructive",
      });
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Review and approve new user registrations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Players</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats.activePlayers || 0}</div>
            <p className="text-xs text-muted-foreground">Approved and active</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users */}
      {pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending user registrations at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Pending Registrations</h2>
          <div className="grid gap-4">
            {pendingUsers.map((user: PendingUser) => (
              <Card key={user.id} className="border-l-4 border-l-orange-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 rounded-full p-3">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {user.email}
                          </div>
                          {user.nationality && (
                            <div className="flex items-center">
                              <span className="mr-1">{getCountryFlag(user.nationality)}</span>
                              {user.nationality}
                            </div>
                          )}
                          {user.position && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {user.position}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                            {user.role}
                          </Badge>
                          <span className="ml-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Registered {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>User Details</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {selectedUser.firstName} {selectedUser.lastName}
                                </h4>
                                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                              </div>
                              
                              {selectedUser.dateOfBirth && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                                  <p className="text-sm text-gray-900">{selectedUser.dateOfBirth}</p>
                                </div>
                              )}
                              
                              {selectedUser.nationality && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Nationality</label>
                                  <p className="text-sm text-gray-900">
                                    {getCountryFlag(selectedUser.nationality)} {selectedUser.nationality}
                                  </p>
                                </div>
                              )}
                              
                              {selectedUser.position && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Position</label>
                                  <p className="text-sm text-gray-900">{selectedUser.position}</p>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700">Role</label>
                                <p className="text-sm text-gray-900">{selectedUser.role}</p>
                              </div>
                              
                              <div className="flex space-x-2 pt-4">
                                <Button
                                  onClick={() => approveMutation.mutate(selectedUser.id)}
                                  disabled={approveMutation.isPending}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => rejectMutation.mutate(selectedUser.id)}
                                  disabled={rejectMutation.isPending}
                                  variant="destructive"
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={() => approveMutation.mutate(user.id)}
                        disabled={approveMutation.isPending}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate(user.id)}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}