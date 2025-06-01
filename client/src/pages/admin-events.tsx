import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AddEventModal from "@/components/add-event-modal";
import type { Event } from "@shared/schema";

export default function AdminEvents() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest(`/api/events/${eventId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
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

  // Check if user is admin
  if (authLoading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
      </div>
    </div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage events for the talent program
            </p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No events scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by creating your first event
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: Event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deleteEventMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {event.type && (
                    <Badge variant="secondary" className="w-fit">
                      {event.type}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                  )}
                  
                  {event.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                      {event.description}
                    </p>
                  )}
                  
                  {event.notes && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <span className="font-medium">Notes: </span>
                      {event.notes}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Created by {event.createdBy}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AddEventModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}