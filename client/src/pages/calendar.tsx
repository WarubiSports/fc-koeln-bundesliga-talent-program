import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Plus, Clock, MapPin, Users, FileText, ChevronDown, Dumbbell, Snowflake, BookOpen, Stethoscope, UserCheck, Target, Edit, Trash2, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addDays, startOfDay, endOfDay, addWeeks, subWeeks, subDays, isToday } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import ExcuseModal from "@/components/excuse-modal";
import ExcuseStats from "@/components/excuse-stats";
import EditEventModal from "@/components/edit-event-modal";
import EventCreationModal from "@/components/event-creation-modal";
import type { Event } from "@shared/schema";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "training" | "match" | "meeting" | "house" | "other";
  description?: string;
  participants?: string[];
  targetPlayers?: string[]; // Specific players this event is for
  targetGroups?: string[]; // Player groups this event is for (U18, U21, Goalkeepers, etc.)
  isPrivate?: boolean; // Whether event is visible only to target players/groups
  isAdminEvent?: boolean; // Whether this is an admin-created event from database
  adminEventId?: number; // The actual database event ID
  endTime?: string;
  eventType?: string;
  createdBy?: string;
}

// Generate practice sessions for weekdays
const generatePracticeSessions = () => {
  const events: CalendarEvent[] = [];
  let eventId = 1;
  
  // Generate for the next 4 weeks
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 28);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    // Monday = 1, Tuesday = 2, Wednesday = 3, Thursday = 4, Friday = 5
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      events.push({
        id: eventId++,
        title: "Daily Practice Session",
        date: date.toISOString().split('T')[0],
        time: "10:00",
        endTime: "11:45",
        location: "FC Köln Training Ground",
        type: "training",
        description: "Daily training session - 10:00 AM to 11:45 AM",
        participants: ["Bundesliga Talent Program"],
        targetGroups: ["Bundesliga Talent Program"]
      });
    }
  }
  
  return events;
};

const additionalEvents: CalendarEvent[] = [
  {
    id: 1000,
    title: "House Meeting - Widdersdorf 1",
    date: "2024-06-03",
    time: "19:00",
    location: "Widdersdorf 1 Common Room",
    type: "house",
    description: "Weekly house rules discussion and chore assignments",
    targetGroups: ["Widdersdorf 1 Residents"]
  },
  {
    id: 1001,
    title: "Match vs Bayer Leverkusen Academy",
    date: "2024-06-08",
    time: "14:00",
    location: "RheinEnergieSTADION",
    type: "match",
    description: "Academy league match against Bayer Leverkusen",
    targetGroups: ["Bundesliga Talent Program"]
  },
  {
    id: 1002,
    title: "Team Strategy Meeting",
    date: "2024-06-05",
    time: "16:00",
    location: "Conference Room",
    type: "meeting",
    description: "Weekly tactical review and upcoming match preparation",
    targetGroups: ["Bundesliga Talent Program"]
  },
  {
    id: 1003,
    title: "Individual Technical Training",
    date: "2024-06-04",
    time: "15:00",
    location: "Training Ground B",
    type: "training",
    description: "Personalized ball control and finishing practice",
    targetPlayers: ["Max Mueller", "Erik Fischer"],
    isPrivate: true
  },
  {
    id: 1004,
    title: "Goalkeeper Specific Training",
    date: "2024-06-06",
    time: "08:00",
    location: "Goal Practice Area",
    type: "training",
    description: "Shot stopping, distribution and positioning drills",
    targetGroups: ["Goalkeepers"],
    isPrivate: false
  },
  {
    id: 1005,
    title: "Injury Recovery Session",
    date: "2024-06-07",
    time: "13:00",
    location: "Medical Center",
    type: "other",
    description: "Physiotherapy and light training for recovering players",
    targetPlayers: ["Hans Weber"],
    isPrivate: true
  },
  {
    id: 1006,
    title: "Team Evaluation Meeting",
    date: "2024-06-09",
    time: "11:00",
    location: "Tactics Room",
    type: "meeting",
    description: "Monthly progress review and development planning",
    targetGroups: ["Bundesliga Talent Program"],
    isPrivate: false
  },
  {
    id: 1007,
    title: "Speed & Agility Training",
    date: "2024-06-10",
    time: "09:00",
    location: "Athletic Track",
    type: "training",
    description: "Sprint intervals and cone drills for improved acceleration",
    targetGroups: ["Midfielders", "Forwards"],
    isPrivate: false
  },
  {
    id: 1008,
    title: "Defensive Tactics Workshop",
    date: "2024-06-11",
    time: "14:30",
    location: "Video Analysis Room",
    type: "meeting",
    description: "Set piece defending and pressing strategies",
    targetGroups: ["Defenders", "Midfielders"],
    isPrivate: false
  }
];

const sampleEvents: CalendarEvent[] = [...generatePracticeSessions(), ...additionalEvents];

export default function CalendarPage() {
  const { user, isAuthenticated } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('month');
  const [events] = useState<CalendarEvent[]>(sampleEvents);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);
  const [isEventCreationModalOpen, setIsEventCreationModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("All Players");
  const [selectedGroup, setSelectedGroup] = useState<string>("All Groups");
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Fetch admin events from database
  const { data: adminEvents = [] } = useQuery({
    queryKey: ["/api/events"],
    enabled: isAuthenticated,
  });



  const isAdmin = user?.role === 'admin';

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      await apiRequest("POST", "/api/events", eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
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

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
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

  const handleAddEvent = (eventType: string) => {
    const eventTitles = {
      'team-practice': 'Daily Practice Session',
      'group-practice': 'Group Practice Session', 
      'cryotherapy': 'Cryotherapy Session',
      'language-school': 'Language School',
      'weight-lifting': 'Weight Lifting Session',
      'doctor-appointment': "Doctor's Appointment",
      'trial': 'Trial Session'
    };

    if (isAdmin) {
      // For admins, open the detailed event creation modal
      setSelectedEventType(eventTitles[eventType as keyof typeof eventTitles] || 'Other');
      setIsEventCreationModalOpen(true);
    } else {
      // For players, this opens the excuse modal for the selected activity
      setIsExcuseModalOpen(true);
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setIsEditEventModalOpen(true);
  };

  const handleEventSubmit = (eventData: any) => {
    if (eventData.isRecurring) {
      // Create multiple events for recurring pattern
      const events = generateRecurringEvents(eventData);
      events.forEach(event => {
        createEventMutation.mutate(event);
      });
    } else {
      // Create single event
      createEventMutation.mutate(eventData);
    }
  };

  const generateRecurringEvents = (eventData: any) => {
    const events = [];
    const startDate = new Date(eventData.date);
    const count = parseInt(eventData.recurringCount) || 4;
    const endDate = eventData.recurringEndDate ? new Date(eventData.recurringEndDate) : null;

    for (let i = 0; i < count; i++) {
      const eventDate = new Date(startDate);
      
      // Calculate the date for this occurrence
      switch (eventData.recurringType) {
        case 'daily':
          eventDate.setDate(startDate.getDate() + i);
          break;
        case 'weekly':
          eventDate.setDate(startDate.getDate() + (i * 7));
          break;
        case 'biweekly':
          eventDate.setDate(startDate.getDate() + (i * 14));
          break;
        case 'monthly':
          eventDate.setMonth(startDate.getMonth() + i);
          break;
      }

      // Stop if we've passed the end date
      if (endDate && eventDate > endDate) {
        break;
      }

      // Create event data for this occurrence
      const event = {
        ...eventData,
        date: eventDate.toISOString().split('T')[0],
        title: i === 0 ? eventData.title : `${eventData.title} (${i + 1}/${count})`,
        notes: eventData.notes + (i === 0 ? ' (Recurring series)' : ` (Part ${i + 1} of recurring series)`)
      };

      // Remove recurring-specific fields from individual events
      delete event.isRecurring;
      delete event.recurringType;
      delete event.recurringEndDate;
      delete event.recurringCount;

      events.push(event);
    }

    return events;
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Navigation functions
  const navigatePrevious = () => {
    switch (calendarView) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (calendarView) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Date range calculations for different views
  const getDateRange = () => {
    switch (calendarView) {
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
          title: format(currentDate, 'EEEE, MMMM d, yyyy')
        };
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return {
          start: weekStart,
          end: weekEnd,
          title: `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
        };
      case 'month':
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        return {
          start: monthStart,
          end: monthEnd,
          title: format(currentDate, 'MMMM yyyy')
        };
      default:
        return {
          start: new Date(),
          end: new Date(),
          title: ''
        };
    }
  };

  const dateRange = getDateRange();

  // Calendar rendering functions
  const renderDayView = () => {
    const dayEvents = getEventsForDate(format(currentDate, 'yyyy-MM-dd'));
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // Start at 6 AM, end at 11 PM

    const formatTime12Hour = (hour: number) => {
      if (hour === 0) return '12:00 AM';
      if (hour === 12) return '12:00 PM';
      if (hour < 12) return `${hour}:00 AM`;
      return `${hour - 12}:00 PM`;
    };

    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex">
            {/* Time labels column */}
            <div className="w-20 flex-shrink-0">
              {hours.map(hour => {
                const timeSlot = formatTime12Hour(hour);
                return (
                  <div key={hour} className="min-h-[68px] border-b border-gray-100 flex items-start pt-1">
                    <div className="text-xs text-gray-500 font-medium w-full text-right pr-3">
                      {timeSlot}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Events timeline */}
            <div className="flex-1 border-l border-gray-200 relative">
              {hours.map(hour => {
                return (
                  <div key={hour} className="relative min-h-[68px] border-b border-gray-100">
                    {/* Event container */}
                    <div className="ml-4 relative h-full">
                      {/* Events that start at this hour */}
                      {dayEvents
                        .filter(event => {
                          const startTime = event.time || event.startTime;
                          const startHour = parseInt(startTime.split(':')[0]);
                          return startHour === hour;
                        })
                        .map(event => {
                          const startTime = event.time || event.startTime;
                          const endTime = event.endTime;
                          const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;
                          
                          // Calculate how many hours this event spans
                          let eventHeight = 60; // Base height for 1 hour
                          if (endTime) {
                            const startHour = parseInt(startTime.split(':')[0]);
                            const startMinute = parseInt(startTime.split(':')[1] || '0');
                            const endHour = parseInt(endTime.split(':')[0]);
                            const endMinute = parseInt(endTime.split(':')[1] || '0');
                            
                            const startTotalMinutes = startHour * 60 + startMinute;
                            const endTotalMinutes = endHour * 60 + endMinute;
                            const durationMinutes = endTotalMinutes - startTotalMinutes;
                            
                            // Each hour slot is 68px total
                            eventHeight = Math.max(60, (durationMinutes / 60) * 68 - 8);
                          }
                          
                          return (
                            <div 
                              key={event.id} 
                              className="absolute left-0 right-4 bg-fc-red/10 border-l-4 border-fc-red rounded text-xs p-3 z-10 flex flex-col justify-center group hover:bg-fc-red/20 transition-colors"
                              style={{ 
                                height: `${eventHeight}px`,
                                top: '4px'
                              }}
                            >
                              <div className="font-medium text-center">{event.title}</div>
                              <div className="text-gray-600 text-center mt-1">{timeDisplay}</div>
                              {event.location && <div className="text-gray-500 text-center text-[10px] mt-1">{event.location}</div>}
                              
                              {/* Admin edit buttons - only show for database events */}
                              {isAdmin && event.isAdminEvent && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-gray-600 hover:text-fc-red hover:bg-white/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Find the actual Event object from adminEvents
                                      const actualEvent = adminEvents.find((ae: any) => ae.id === event.adminEventId);
                                      if (actualEvent) {
                                        handleEditEvent(actualEvent);
                                      }
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-gray-600 hover:text-red-600 hover:bg-white/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (event.adminEventId) {
                                        deleteEventMutation.mutate(event.adminEventId);
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // Start at 6 AM, end at 11 PM

    const formatTime12Hour = (hour: number) => {
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      if (hour < 12) return `${hour} AM`;
      return `${hour - 12} PM`;
    };
    
    return (
      <div className="grid grid-cols-8 gap-1 border rounded-lg overflow-hidden">
        <div className="p-2 bg-gray-50 text-xs font-medium">Time</div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="p-2 bg-gray-50 text-xs font-medium text-center">
            <div>{format(day, 'EEE')}</div>
            <div className={`${isToday(day) ? 'text-fc-red font-bold' : ''}`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
        
        {hours.map(hour => (
          <div key={hour} className="contents">
            <div className="p-2 text-xs text-gray-500 border-t font-medium">
              {formatTime12Hour(hour)}
            </div>
            {weekDays.map(day => {
              const dayEvents = getEventsForDate(format(day, 'yyyy-MM-dd'));
              
              return (
                <div key={`${day.toISOString()}-${hour}`} className="p-1 border-t min-h-[48px] relative">
                  {/* Events that start at this hour */}
                  {dayEvents
                    .filter(event => {
                      const startTime = event.time || event.startTime;
                      const startHour = parseInt(startTime.split(':')[0]);
                      return startHour === hour;
                    })
                    .map(event => {
                      const startTime = event.time || event.startTime;
                      const endTime = event.endTime;
                      const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;
                      
                      // Calculate how many hours this event spans for week view
                      let eventHeight = 40; // Base height for 1 hour in week view
                      if (endTime) {
                        const startHour = parseInt(startTime.split(':')[0]);
                        const startMinute = parseInt(startTime.split(':')[1] || '0');
                        const endHour = parseInt(endTime.split(':')[0]);
                        const endMinute = parseInt(endTime.split(':')[1] || '0');
                        
                        const startTotalMinutes = startHour * 60 + startMinute;
                        const endTotalMinutes = endHour * 60 + endMinute;
                        const durationMinutes = endTotalMinutes - startTotalMinutes;
                        
                        // Each hour slot is 48px total in week view
                        eventHeight = Math.max(40, (durationMinutes / 60) * 48 - 8);
                      }
                      
                      return (
                        <div 
                          key={event.id} 
                          className="absolute left-1 right-1 bg-fc-red/10 border-l-2 border-fc-red rounded text-xs p-1 z-10 flex flex-col justify-center"
                          style={{ 
                            height: `${eventHeight}px`,
                            top: '4px'
                          }}
                        >
                          <div className="font-medium truncate text-center">{event.title}</div>
                          <div className="text-gray-600 text-[10px] text-center">{timeDisplay}</div>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return (
      <div className="grid grid-cols-7 gap-1 border rounded-lg overflow-hidden">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 bg-gray-50 text-sm font-medium text-center">
            {day}
          </div>
        ))}
        
        {calendarDays.map(day => {
          const dayEvents = getEventsForDate(format(day, 'yyyy-MM-dd'));
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, new Date(selectedDate));
          
          return (
            <div 
              key={day.toISOString()} 
              className={`p-2 min-h-[100px] border-t cursor-pointer hover:bg-gray-50 ${
                !isCurrentMonth ? 'text-gray-400 bg-gray-50/50' : ''
              } ${isSelected ? 'bg-fc-red/10' : ''} ${isToday(day) ? 'ring-2 ring-fc-red' : ''}`}
              onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
            >
              <div className={`text-sm mb-1 ${isToday(day) ? 'font-bold text-fc-red' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const startTime = event.time || event.startTime;
                  const endTime = event.endTime;
                  const timeDisplay = endTime ? `${startTime}-${endTime}` : startTime;
                  
                  return (
                    <div key={event.id} className="text-xs p-1 bg-fc-red/10 border-l-2 border-fc-red rounded">
                      <div className="font-medium truncate">{event.title}</div>
                      {timeDisplay && (
                        <div className="text-gray-600 text-[10px] mt-0.5">{timeDisplay}</div>
                      )}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Available players and groups for filtering
  const availablePlayers = ["All Players", "Max Mueller", "Erik Fischer", "Hans Weber", "Jan Richter"];
  const availableGroups = ["All Groups", "Bundesliga Talent Program", "Goalkeepers", "Midfielders", "Forwards", "Defenders", "Widdersdorf 1 Residents", "Widdersdorf 2 Residents", "Widdersdorf 3 Residents"];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-fc-red text-white";
      case "match":
        return "bg-green-500 text-white";
      case "meeting":
        return "bg-blue-500 text-white";
      case "house":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Helper function to check if an event spans a given hour
  const eventSpansHour = (event: any, hour: number) => {
    if (!event.time && !event.startTime) return false;
    
    const startTime = event.time || event.startTime;
    const endTime = event.endTime;
    
    // Parse start time (handle both "10:00" and "10" formats)
    const startParts = startTime.split(':');
    const startHour = parseInt(startParts[0]);
    const startMinute = startParts[1] ? parseInt(startParts[1]) : 0;
    
    if (endTime) {
      // Parse end time
      const endParts = endTime.split(':');
      const endHour = parseInt(endParts[0]);
      const endMinute = endParts[1] ? parseInt(endParts[1]) : 0;
      
      // Convert times to minutes for easier comparison
      const startTimeMinutes = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;
      const hourStart = hour * 60;
      const hourEnd = (hour + 1) * 60;
      
      // Event spans this hour if it overlaps with the hour timeframe
      return startTimeMinutes < hourEnd && endTimeMinutes > hourStart;
    } else {
      // No end time, only show at start hour
      return startHour === hour;
    }
  };

  const getEventsForDate = (date: string) => {
    // Combine static events with database events
    const staticEvents = filterEvents(events.filter(event => event.date === date));
    const dbEvents = adminEvents
      .filter((event: Event) => event.date === date)
      .map((event: Event) => ({
        id: event.id + 10000, // Offset to avoid ID conflicts
        title: event.title,
        date: event.date,
        time: event.startTime,
        location: event.location || "TBD",
        type: event.eventType?.toLowerCase().includes('practice') ? 'training' as const : 
              event.eventType?.toLowerCase().includes('match') ? 'match' as const :
              event.eventType?.toLowerCase().includes('meeting') ? 'meeting' as const : 'other' as const,
        description: event.notes || undefined,
        targetGroups: ["Bundesliga Talent Program"],
        isPrivate: false,
        isAdminEvent: true,
        adminEventId: event.id,
        endTime: event.endTime,
        eventType: event.eventType,
        createdBy: event.createdBy
      }));
    
    return [...staticEvents, ...dbEvents];
  };

  const filterEvents = (eventList: CalendarEvent[]) => {
    return eventList.filter(event => {
      // Filter by player
      if (selectedPlayer !== "All Players") {
        if (event.targetPlayers && !event.targetPlayers.includes(selectedPlayer)) {
          return false;
        }
        if (!event.targetPlayers && event.targetGroups && !event.targetGroups.includes("Bundesliga Talent Program")) {
          return false;
        }
      }

      // Filter by group
      if (selectedGroup !== "All Groups") {
        if (event.targetGroups && !event.targetGroups.includes(selectedGroup) && !event.targetGroups.includes("Bundesliga Talent Program")) {
          return false;
        }
        if (!event.targetGroups && selectedGroup !== "All Groups") {
          return false;
        }
      }

      return true;
    });
  };

  const formatSelectedDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const todayEvents = getEventsForDate(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-fc-dark">Calendar</h1>
            <p className="text-gray-600 mt-2">Manage training sessions, matches and events</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              onClick={() => setIsExcuseModalOpen(true)}
              variant="outline" 
              className="border-fc-red text-fc-red hover:bg-fc-red hover:text-white w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Request Excuse
            </Button>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-fc-red hover:bg-fc-red/90 text-white w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleAddEvent('team-practice')}>
                  <Users className="w-4 h-4 mr-2" />
                  Daily Practice Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('group-practice')}>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Group Practice Session
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('cryotherapy')}>
                  <Snowflake className="w-4 h-4 mr-2" />
                  Cryotherapy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('language-school')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Language School
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('weight-lifting')}>
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Weight Lifting
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('doctor-appointment')}>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Doctor's Appointment
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddEvent('trial')}>
                  <Target className="w-4 h-4 mr-2" />
                  Trial
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendar & Events</TabsTrigger>
            <TabsTrigger value="excuses">Excuse Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Player and Group Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Event Filters</CardTitle>
                <p className="text-gray-600">Filter events by specific players or groups</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Player</label>
                    <select
                      value={selectedPlayer}
                      onChange={(e) => setSelectedPlayer(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {availablePlayers.map((player) => (
                        <option key={player} value={player}>{player}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Group</label>
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {availableGroups.map((group) => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Calendar View */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-fc-red" />
                    {dateRange.title}
                  </CardTitle>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* View Toggle */}
                    <Tabs value={calendarView} onValueChange={(value: any) => setCalendarView(value)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="day">Day</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="month">Month</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    {/* Navigation */}
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Button variant="outline" size="sm" onClick={navigatePrevious}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="sm" onClick={navigateNext}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={calendarView}>
                  <TabsContent value="day" className="mt-0">
                    {renderDayView()}
                  </TabsContent>
                  <TabsContent value="week" className="mt-0">
                    {renderWeekView()}
                  </TabsContent>
                  <TabsContent value="month" className="mt-0">
                    {renderMonthView()}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Event Details */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Events for {formatSelectedDate(selectedDate)}</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayEvents.length > 0 ? (
                    <div className="space-y-4">
                      {todayEvents.map((event) => (
                        <div
                          key={event.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <div className="flex items-center gap-2">
                              <Badge className={getEventTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              {isAdmin && event.isAdminEvent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteEvent(event.adminEventId)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                  title="Delete event"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {(() => {
                                const startTime = event.time || event.startTime;
                                const endTime = event.endTime;
                                return endTime ? `${startTime} - ${endTime}` : startTime;
                              })()}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                            {event.participants && (
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {event.participants.join(", ")}
                              </div>
                            )}
                          </div>

                          {/* Target Players/Groups Information */}
                          {(event.targetPlayers || event.targetGroups) && (
                            <div className="mb-2">
                              {event.targetPlayers && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Players: {event.targetPlayers.join(", ")}
                                  </Badge>
                                  {event.isPrivate && (
                                    <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                      Private
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {event.targetGroups && (
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Groups: {event.targetGroups.join(", ")}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {event.description && (
                            <p className="text-sm text-gray-600">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No events scheduled</h3>
                      <p className="text-gray-600">No events are scheduled for this date.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <p className="text-gray-600">Next events across all categories</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterEvents(events).slice(0, 6).map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{event.title}</h4>
                        <Badge className={getEventTypeColor(event.type)} variant="outline">
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1 mb-2">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {event.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {event.location}
                        </div>
                      </div>

                      {/* Target Information for Upcoming Events */}
                      {(event.targetPlayers || event.targetGroups) && (
                        <div className="space-y-1">
                          {event.targetPlayers && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                {event.targetPlayers.join(", ")}
                              </Badge>
                              {event.isPrivate && (
                                <Badge variant="outline" className="text-xs bg-amber-50 text-amber-600 border-amber-200">
                                  Private
                                </Badge>
                              )}
                            </div>
                          )}
                          {event.targetGroups && (
                            <div>
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-600 border-green-200">
                                {event.targetGroups.join(", ")}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="excuses" className="space-y-6">
            <ExcuseStats />
          </TabsContent>
        </Tabs>

        <ExcuseModal 
          isOpen={isExcuseModalOpen}
          onClose={() => setIsExcuseModalOpen(false)}
        />
        
        <EventCreationModal
          isOpen={isEventCreationModalOpen}
          onClose={() => setIsEventCreationModalOpen(false)}
          onSubmit={handleEventSubmit}
          initialEventType={selectedEventType}
          initialDate={selectedDate}
        />

        <EditEventModal
          isOpen={isEditEventModalOpen}
          onClose={() => setIsEditEventModalOpen(false)}
          event={editingEvent}
        />

      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2">
        <div className="flex justify-around">
          <a href="/" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Dashboard</span>
          </a>
          <a href="/players" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-users text-lg mb-1"></i>
            <span className="text-xs">Players</span>
          </a>
          <a href="/chores" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">Housing</span>
          </a>
          <a href="/food-orders" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-shopping-cart text-lg mb-1"></i>
            <span className="text-xs">Groceries</span>
          </a>
          <a href="/communications" className="flex flex-col items-center py-2 text-gray-600">
            <i className="fas fa-comments text-lg mb-1"></i>
            <span className="text-xs">Messages</span>
          </a>
          <button className="flex flex-col items-center py-2 text-fc-red">
            <i className="fas fa-calendar text-lg mb-1"></i>
            <span className="text-xs">Calendar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}