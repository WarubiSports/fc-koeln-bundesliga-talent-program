import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, FileText, Type } from "lucide-react";
import type { Event } from "@shared/schema";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function EditEventModal({ isOpen, onClose, event }: EditEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    eventType: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: ""
  });

  // Populate form when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        eventType: event.eventType || "",
        date: event.date || "",
        startTime: event.startTime || "",
        endTime: event.endTime || "",
        location: event.location || "",
        notes: event.notes || ""
      });
    }
  }, [event]);

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest(`/api/events/${event?.id}`, "PUT", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.startTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateEventMutation.mutate(formData);
  };

  const eventTypes = [
    "Daily Practice Session",
    "Group Practice Session",
    "Match",
    "Team Meeting",
    "Individual Training",
    "Medical Appointment",
    "Language School",
    "Weight Lifting Session",
    "Cryotherapy Session",
    "Trial Session",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Event Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select
              value={formData.eventType}
              onValueChange={(value) => setFormData({ ...formData, eventType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateEventMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-fc-red hover:bg-fc-red/90"
              disabled={updateEventMutation.isPending}
            >
              {updateEventMutation.isPending ? "Updating..." : "Update Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}