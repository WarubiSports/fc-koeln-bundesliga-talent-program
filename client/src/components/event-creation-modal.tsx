import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CalendarDays, Clock, MapPin, FileText, Repeat } from "lucide-react";

interface EventCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
  initialEventType?: string;
  initialDate?: string;
}

const eventTypeOptions = [
  { value: "Team Practice Session", label: "Team Practice Session" },
  { value: "Group Practice Session", label: "Group Practice Session" },
  { value: "Cryotherapy Session", label: "Cryotherapy Session" },
  { value: "Language School", label: "Language School" },
  { value: "Weight Lifting Session", label: "Weight Lifting Session" },
  { value: "Doctor's Appointment", label: "Doctor's Appointment" },
  { value: "Trial Session", label: "Trial Session" },
  { value: "Match", label: "Match" },
  { value: "Team Meeting", label: "Team Meeting" },
  { value: "Fitness Assessment", label: "Fitness Assessment" },
  { value: "Recovery Session", label: "Recovery Session" },
  { value: "Other", label: "Other" }
];

const locationOptions = [
  "FC Köln Training Ground",
  "RheinEnergieSTADION",
  "FC Köln Academy",
  "Geißbockheim Training Center",
  "Widdersdorf Sports Complex",
  "Müngersdorf Athletic Center",
  "External Facility",
  "Medical Center",
  "Language School Campus",
  "Other Location"
];

export default function EventCreationModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEventType = "",
  initialDate = ""
}: EventCreationModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    eventType: initialEventType,
    date: initialDate,
    startTime: "10:00",
    endTime: "12:00",
    location: "FC Köln Training Ground",
    notes: "",
    isRecurring: false,
    recurringType: "weekly",
    recurringEndDate: "",
    recurringCount: 4
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: "",
      eventType: "",
      date: "",
      startTime: "10:00",
      endTime: "12:00",
      location: "FC Köln Training Ground",
      notes: "",
      isRecurring: false,
      recurringType: "weekly",
      recurringEndDate: "",
      recurringCount: 4
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate title if eventType changes and title is empty
      ...(field === 'eventType' && !prev.title ? { title: value } : {})
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-fc-red" />
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Schedule a new event for the 1.FC Köln International Talent Program
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => handleInputChange('eventType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter custom title (optional)"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange('location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional details or instructions..."
              rows={3}
            />
          </div>

          {/* Recurring Event Options */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleInputChange('isRecurring', checked.toString())}
              />
              <Label htmlFor="isRecurring" className="flex items-center gap-2 cursor-pointer">
                <Repeat className="w-4 h-4" />
                Create recurring event
              </Label>
            </div>

            {formData.isRecurring && (
              <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurringType">Repeat Pattern</Label>
                    <Select
                      value={formData.recurringType}
                      onValueChange={(value) => handleInputChange('recurringType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select pattern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays (Mon-Fri)</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurringCount">Number of Events</Label>
                    <Input
                      id="recurringCount"
                      type="number"
                      min="2"
                      max="52"
                      value={formData.recurringCount}
                      onChange={(e) => handleInputChange('recurringCount', e.target.value)}
                      placeholder="4"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringEndDate">End Date (Optional)</Label>
                  <Input
                    id="recurringEndDate"
                    type="date"
                    value={formData.recurringEndDate}
                    onChange={(e) => handleInputChange('recurringEndDate', e.target.value)}
                    placeholder="Leave empty to use count"
                  />
                  <p className="text-xs text-gray-500">
                    Leave empty to create {formData.recurringCount} events, or set an end date
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-fc-red hover:bg-fc-red/90 text-white"
              disabled={!formData.eventType || !formData.date}
            >
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}