import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, User, Mail, MapPin, Calendar, Trash2, AlertTriangle, Edit, Phone, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCountryFlag } from "@/lib/country-flags";

interface ApprovedUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  nationality?: string;
  nationalityCode?: string;
  position?: string;
  role: string;
  status: string;
  house?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ApprovedUser | null>(null);
  const [editingUser, setEditingUser] = useState<ApprovedUser | null>(null);
  

  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    nationality: "",
    position: "",
    house: "",
    role: ""
  });

  const { data: approvedUsers = [], isLoading, error } = useQuery<ApprovedUser[]>({
    queryKey: ["/api/admin/approved-users"],
    refetchInterval: 30000,
  });



  const { data: userStats = {} } = useQuery<{
    totalUsers: number;
    pendingUsers: number;
    approvedUsers: number;
    activePlayers: number;
  }>({
    queryKey: ["/api/admin/user-stats"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/delete-user/${userId}`, "DELETE");
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      const user = approvedUsers.find(u => u.id === userId);
      toast({
        title: "Member Deleted",
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

  const editMutation = useMutation({
    mutationFn: async (data: { userId: string; updateData: any }) => {
      await apiRequest(`/api/admin/update-user/${data.userId}`, "PUT", data.updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/approved-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      
      toast({
        title: "Member Updated",
        description: "Member information has been successfully updated.",
        variant: "default",
      });
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: ApprovedUser) => {
    setEditingUser(user);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth || "",
      nationality: user.nationality || "",
      position: user.position || "",
      house: user.house || "",
      role: user.role
    });
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    
    editMutation.mutate({
      userId: editingUser.id,
      updateData: editForm
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
        <p className="mt-2 text-gray-600">
          Manage existing approved players and staff members
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{userStats.approvedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Approved users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {approvedUsers.filter(u => u.role === 'player').length}
            </div>
            <p className="text-xs text-muted-foreground">Active players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {approvedUsers.filter(u => u.role !== 'player' && u.role !== 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Staff members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {approvedUsers.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">All Members</h2>
        
        {approvedUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
              <p className="text-gray-600">No approved members in the system.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {approvedUsers.map((user: ApprovedUser) => (
              <Card key={user.id} className="border-l-4 border-l-green-400">
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
                          <Badge variant={user.role === "admin" ? "destructive" : user.role === "player" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                          <span className="ml-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 inline mr-1" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
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
                            <DialogTitle>Member Details</DialogTitle>
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

                              {selectedUser.house && (
                                <div>
                                  <label className="text-sm font-medium text-gray-700">House</label>
                                  <p className="text-sm text-gray-900">{selectedUser.house}</p>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700">Role</label>
                                <p className="text-sm text-gray-900">{selectedUser.role}</p>
                              </div>
                              
                              {/* Delete button - only for Max Bisinger */}
                              <div className="flex space-x-2 pt-4 border-t">
                                <Button
                                  onClick={() => {
                                    if (window.confirm(`⚠️ PERMANENT DELETION\n\nAre you absolutely sure you want to delete ${selectedUser.firstName} ${selectedUser.lastName}?\n\nThis will:\n• Remove their user account\n• Delete their player profile\n• Remove all associated data\n\nThis action CANNOT be undone.`)) {
                                      deleteMutation.mutate(selectedUser.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  variant="destructive"
                                  className="bg-red-800 hover:bg-red-900 flex-1"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {deleteMutation.isPending ? "Deleting..." : "Delete Member"}
                                </Button>
                              </div>

                              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <div className="flex">
                                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                                  <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">
                                      Deletion Warning
                                    </h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                      Only Max Bisinger can delete members. This action will permanently remove all user data.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      {/* Edit button */}
                      <Button
                        onClick={() => handleEditUser(user)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Quick delete button */}
                      <Button
                        onClick={() => {
                          if (window.confirm(`⚠️ DELETE ${user.firstName} ${user.lastName}?\n\nThis will permanently remove:\n• User account\n• Player profile\n• All data\n\nCannot be undone!`)) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                        size="sm"
                        className="bg-red-800 hover:bg-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Member Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Member: {editingUser.firstName} {editingUser.lastName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={editForm.nationality}
                  onChange={(e) => setEditForm({...editForm, nationality: e.target.value})}
                  placeholder="e.g., Germany"
                />
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={editForm.position}
                  onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                  placeholder="e.g., Midfielder"
                />
              </div>

              <div>
                <Label htmlFor="house">House</Label>
                <Select value={editForm.house} onValueChange={(value) => setEditForm({...editForm, house: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select house" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Widdersdorf 1">Widdersdorf 1</SelectItem>
                    <SelectItem value="Widdersdorf 2">Widdersdorf 2</SelectItem>
                    <SelectItem value="Widdersdorf 3">Widdersdorf 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm({...editForm, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={editMutation.isPending}
                  className="flex-1"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  onClick={() => setEditingUser(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}