import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Trash2, Edit, ChevronLeft, ChevronRight, Check, ChevronsUpDown, X } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  startOfDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths
} from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema, type Event, type InsertEvent } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SectionOverview from "@/components/section-overview";

type CalendarView = "month" | "week" | "day";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("month");
  const [selectedPlayer, setSelectedPlayer] = useState<string>("all");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [participantsPopoverOpen, setParticipantsPopoverOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"]
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/players"]
  });

  // Filter events based on selected player
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    
    if (selectedPlayer === "all") {
      return events as Event[];
    }
    
    return (events as Event[]).filter((event: Event) => {
      if (!event.participants) return false;
      
      // Check if event is for all players
      if (event.participants.toLowerCase().includes("all")) return true;
      
      // Check if specific player is in participants list
      const participantList = event.participants.toLowerCase().split(",").map(p => p.trim());
      return participantList.includes(selectedPlayer.toLowerCase()) ||
             participantList.some(p => p.includes(selectedPlayer.toLowerCase()));
    });
  }, [events, selectedPlayer]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      return apiRequest("/api/events", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertEvent>) => {
      return apiRequest(`/api/events/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/events/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setSelectedEvent(null);
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      eventType: "team_practice",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
      participants: "",
      isRecurring: false,
      recurringPattern: "",
      recurringEndDate: "",
      recurringDays: "",
      createdBy: user?.id || "dev-admin"
    }
  });

  const editForm = useForm({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      eventType: "team_practice",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      notes: "",
      participants: "",
      isRecurring: false,
      recurringPattern: "",
      recurringEndDate: "",
      recurringDays: "",
      createdBy: user?.id || "dev-admin"
    }
  });

  const getEventTitle = (eventType: string) => {
    const titles = {
      "match": "Match",
      "team_practice": "Team Practice",
      "group_practice": "Group Practice", 
      "individual_training": "Individual Training",
      "fitness_session": "Fitness Session",
      "tactical_training": "Tactical Training",
      "medical_checkup": "Medical Checkup",
      "team_meeting": "Team Meeting",
      "travel": "Travel"
    };
    return titles[eventType as keyof typeof titles] || eventType;
  };

  const onSubmit = (data: InsertEvent) => {
    createMutation.mutate({
      ...data,
      title: getEventTitle(data.eventType),
      date: format(currentDate, "yyyy-MM-dd"),
      createdBy: user?.id || "system"
    });
  };

  const onEditSubmit = (data: InsertEvent) => {
    if (selectedEvent) {
      updateMutation.mutate({ 
        id: selectedEvent.id, 
        ...data,
        title: getEventTitle(data.eventType)
      });
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    editForm.reset({
      title: event.title,
      eventType: event.eventType,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || "",
      notes: event.notes || "",
      participants: event.participants || "",
      isRecurring: event.isRecurring || false,
      recurringPattern: event.recurringPattern || "",
      recurringEndDate: event.recurringEndDate || "",
      recurringDays: event.recurringDays || "",
      createdBy: event.createdBy
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteMutation.mutate(event.id);
    }
  };

  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    return Array.isArray(events) ? events.filter((event: Event) => 
      event.date === dayStr
    ) : [];
  };

  const navigate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate(direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
    } else {
      setCurrentDate(direction === "prev" ? addDays(currentDate, -1) : addDays(currentDate, 1));
    }
  };

  const getCalendarTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-500 border-r last:border-r-0">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayEvents = filteredEvents.filter((event: Event) => event.date === dateStr);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-28 p-2 border-r border-b last:border-r-0 ${
                    !isSameMonth(day, currentDate) ? "bg-gray-50 text-gray-400" : ""
                  } ${isToday(day) ? "bg-red-50" : ""}`}
                >
                  <div className={`text-sm mb-1 ${isToday(day) ? "font-bold text-red-600" : ""}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event: Event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer truncate ${
                          event.eventType === "match" ? "bg-red-100 text-red-800" :
                          event.eventType === "team_practice" ? "bg-blue-100 text-blue-800" :
                          event.eventType === "group_practice" ? "bg-green-100 text-green-800" :
                          event.eventType === "individual_training" ? "bg-purple-100 text-purple-800" :
                          event.eventType === "fitness_session" ? "bg-orange-100 text-orange-800" :
                          event.eventType === "tactical_training" ? "bg-yellow-100 text-yellow-800" :
                          event.eventType === "weight_lifting" ? "bg-stone-100 text-stone-800" :
                          event.eventType === "cryotherapy" ? "bg-cyan-100 text-cyan-800" :
                          event.eventType === "language_school" ? "bg-emerald-100 text-emerald-800" :
                          event.eventType === "video_session" ? "bg-violet-100 text-violet-800" :
                          event.eventType === "medical_checkup" ? "bg-pink-100 text-pink-800" :
                          event.eventType === "team_meeting" ? "bg-indigo-100 text-indigo-800" :
                          event.eventType === "travel" ? "bg-teal-100 text-teal-800" :
                          event.eventType === "nutrition_consultation" ? "bg-lime-100 text-lime-800" :
                          event.eventType === "mental_coaching" ? "bg-sky-100 text-sky-800" :
                          event.eventType === "physiotherapy" ? "bg-rose-100 text-rose-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {event.startTime && (
                          <div className="font-medium">{event.startTime}</div>
                        )}
                        <div className="truncate">{event.title}</div>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 p-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate) });
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

    return (
      <Card>
        <CardContent className="p-0">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b bg-gray-50">
            <div className="p-3"></div>
            {weekDays.map(day => (
              <div key={day.toISOString()} className="p-3 text-center border-r last:border-r-0">
                <div className="text-sm font-medium text-gray-500">
                  {format(day, "EEE")}
                </div>
                <div className={`text-lg font-semibold ${isToday(day) ? "text-red-600" : ""}`}>
                  {format(day, "d")}
                </div>
              </div>
            ))}
          </div>
          
          {/* Time slots */}
          <div className="max-h-96 overflow-y-auto">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 text-xs text-gray-500 border-r bg-gray-50">
                  {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                </div>
                {weekDays.map(day => {
                  const dayEvents = getEventsForDay(day).filter(event => {
                    if (!event.startTime) return false;
                    const eventHour = parseInt(event.startTime.split(':')[0]);
                    return eventHour === hour;
                  });
                  
                  return (
                    <div key={`${day.toISOString()}-${hour}`} className="p-1 border-r last:border-r-0 min-h-12">
                      {dayEvents.map((event: Event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded cursor-pointer mb-1 ${
                            event.eventType === "match" ? "bg-red-100 text-red-800" :
                            event.eventType === "team_practice" ? "bg-blue-100 text-blue-800" :
                            event.eventType === "group_practice" ? "bg-green-100 text-green-800" :
                            event.eventType === "individual_training" ? "bg-purple-100 text-purple-800" :
                            event.eventType === "fitness_session" ? "bg-orange-100 text-orange-800" :
                            event.eventType === "tactical_training" ? "bg-yellow-100 text-yellow-800" :
                            event.eventType === "medical_checkup" ? "bg-pink-100 text-pink-800" :
                            event.eventType === "team_meeting" ? "bg-indigo-100 text-indigo-800" :
                            event.eventType === "travel" ? "bg-teal-100 text-teal-800" :
                            "bg-gray-100 text-gray-800"
                          }`}
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="font-medium">{event.startTime}</div>
                          <div className="truncate">{event.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderDayView = () => {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const dayEvents = filteredEvents.filter((event: Event) => event.date === dateStr);
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

    return (
      <Card>
        <CardContent className="p-0">
          <div className="border-b bg-gray-50 p-4">
            <h3 className={`text-lg font-semibold ${isToday(currentDate) ? "text-red-600" : ""}`}>
              {format(currentDate, "EEEE, MMMM d, yyyy")}
            </h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {hours.map(hour => {
              const hourEvents = dayEvents.filter(event => {
                if (!event.startTime) return false;
                const eventHour = parseInt(event.startTime.split(':')[0]);
                return eventHour === hour;
              });
              
              return (
                <div key={hour} className="flex border-b">
                  <div className="w-20 p-2 text-xs text-gray-500 border-r bg-gray-50">
                    {format(new Date().setHours(hour, 0, 0, 0), "HH:mm")}
                  </div>
                  <div className="flex-1 p-2 min-h-12">
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`p-2 rounded cursor-pointer mb-2 ${
                          event.eventType === "match" ? "bg-red-100 text-red-800" :
                          event.eventType === "team_practice" ? "bg-blue-100 text-blue-800" :
                          event.eventType === "group_practice" ? "bg-green-100 text-green-800" :
                          event.eventType === "individual_training" ? "bg-purple-100 text-purple-800" :
                          event.eventType === "fitness_session" ? "bg-orange-100 text-orange-800" :
                          event.eventType === "tactical_training" ? "bg-yellow-100 text-yellow-800" :
                          event.eventType === "medical_checkup" ? "bg-pink-100 text-pink-800" :
                          event.eventType === "team_meeting" ? "bg-indigo-100 text-indigo-800" :
                          event.eventType === "travel" ? "bg-teal-100 text-teal-800" :
                          "bg-gray-100 text-gray-800"
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="font-medium text-sm">
                          {event.startTime}
                          {event.endTime && ` - ${event.endTime}`}
                        </div>
                        <div className="font-medium">{event.title}</div>
                        {event.location && (
                          <div className="text-xs opacity-75">📍 {event.location}</div>
                        )}
                      </div>
                    ))}
                    {hourEvents.length === 0 && (
                      <div className="text-gray-300 text-xs">No events</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Calendar</h1>
          
          {/* Player Filter Dropdown */}
          <div className="flex items-center gap-2 ml-6">
            <span className="text-sm text-gray-600">View:</span>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {(players as any[]).map((player: any) => (
                  <SelectItem key={player.id} value={`${player.firstName} ${player.lastName}`}>
                    {player.firstName} {player.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isAdmin && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eventType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select event type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="team_practice">Team Practice</SelectItem>
                            <SelectItem value="group_practice">Group Practice</SelectItem>
                            <SelectItem value="individual_training">Individual Training</SelectItem>
                            <SelectItem value="fitness_session">Fitness Session</SelectItem>
                            <SelectItem value="tactical_training">Tactical Training</SelectItem>
                            <SelectItem value="weight_lifting">Weight Lifting</SelectItem>
                            <SelectItem value="cryotherapy">Cryotherapy</SelectItem>
                            <SelectItem value="language_school">Language School</SelectItem>
                            <SelectItem value="video_session">Video Session</SelectItem>
                            <SelectItem value="match">Match</SelectItem>
                            <SelectItem value="medical_checkup">Medical Checkup</SelectItem>
                            <SelectItem value="team_meeting">Team Meeting</SelectItem>
                            <SelectItem value="travel">Travel</SelectItem>
                            <SelectItem value="nutrition_consultation">Nutrition Consultation</SelectItem>
                            <SelectItem value="mental_coaching">Mental Coaching</SelectItem>
                            <SelectItem value="physiotherapy">Physiotherapy</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Event location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Participants</FormLabel>
                        <FormControl>
                          <Popover open={participantsPopoverOpen} onOpenChange={setParticipantsPopoverOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={participantsPopoverOpen}
                                className="w-full justify-between min-h-10"
                              >
                                {selectedParticipants.length === 0 ? (
                                  "Select participants..."
                                ) : selectedParticipants.includes("all") ? (
                                  "Entire Team"
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {selectedParticipants.slice(0, 2).map((participant) => (
                                      <Badge key={participant} variant="secondary" className="text-xs">
                                        {participant}
                                      </Badge>
                                    ))}
                                    {selectedParticipants.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{selectedParticipants.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Search participants..." />
                                <CommandEmpty>No participants found.</CommandEmpty>
                                <CommandGroup>
                                  <CommandItem
                                    value="all"
                                    onSelect={() => {
                                      const newSelection = selectedParticipants.includes("all") 
                                        ? selectedParticipants.filter(p => p !== "all")
                                        : ["all"];
                                      setSelectedParticipants(newSelection);
                                      field.onChange(newSelection.join(", "));
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        selectedParticipants.includes("all") ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    Entire Team
                                  </CommandItem>
                                  {(players as any[]).map((player: any) => {
                                    const playerName = `${player.firstName} ${player.lastName}`;
                                    return (
                                      <CommandItem
                                        key={player.id}
                                        value={playerName}
                                        onSelect={() => {
                                          const isSelected = selectedParticipants.includes(playerName);
                                          let newSelection;
                                          
                                          if (isSelected) {
                                            newSelection = selectedParticipants.filter(p => p !== playerName);
                                          } else {
                                            newSelection = selectedParticipants.includes("all")
                                              ? [playerName]
                                              : [...selectedParticipants.filter(p => p !== "all"), playerName];
                                          }
                                          
                                          setSelectedParticipants(newSelection);
                                          field.onChange(newSelection.join(", "));
                                        }}
                                        disabled={selectedParticipants.includes("all")}
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            selectedParticipants.includes(playerName) ? "opacity-100" : "opacity-0"
                                          }`}
                                        />
                                        {playerName}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandGroup>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Recurring Event</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Create a repeating event
                          </div>
                        </div>
                        <FormControl>
                          <input 
                            type="checkbox" 
                            checked={field.value} 
                            onChange={field.onChange}
                            className="w-4 h-4"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("isRecurring") && (
                    <>
                      <FormField
                        control={form.control}
                        name="recurringPattern"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Repeat Pattern</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select repeat pattern" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="recurringEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("recurringPattern") === "weekly" && (
                        <FormField
                          control={form.control}
                          name="recurringDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Repeat on Days</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., monday,wednesday,friday" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Create Event"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Calendar Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => navigate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Title */}
          <h2 className="text-xl font-semibold">
            {getCalendarTitle()}
          </h2>
        </div>

        {/* View Selector */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <Button
            size="sm"
            variant={view === "month" ? "default" : "ghost"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button
            size="sm"
            variant={view === "week" ? "default" : "ghost"}
            onClick={() => setView("week")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={view === "day" ? "default" : "ghost"}
            onClick={() => setView("day")}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Calendar Views */}
      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedEvent.title}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(selectedEvent)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedEvent)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.notes && (
                <div>
                  <h4 className="font-medium mb-1">Notes</h4>
                  <p className="text-gray-600">{selectedEvent.notes}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedEvent.date}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {selectedEvent.startTime}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </span>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{selectedEvent.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm capitalize">{selectedEvent.eventType.replace('_', ' ')}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && selectedEvent && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Event title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="team_practice">Team Practice</SelectItem>
                          <SelectItem value="group_practice">Group Practice</SelectItem>
                          <SelectItem value="individual_training">Individual Training</SelectItem>
                          <SelectItem value="fitness_session">Fitness Session</SelectItem>
                          <SelectItem value="tactical_training">Tactical Training</SelectItem>
                          <SelectItem value="match">Match</SelectItem>
                          <SelectItem value="medical_checkup">Medical Checkup</SelectItem>
                          <SelectItem value="team_meeting">Team Meeting</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update Event"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      )}

      <SectionOverview />
    </div>
  );
}