import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Clock, MapPin, Users, FileText } from "lucide-react";
import { useState } from "react";
import PracticeExcuseModal from "@/components/practice-excuse-modal";
import PracticeExcuseStats from "@/components/practice-excuse-stats";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: "training" | "match" | "meeting" | "house" | "other";
  description?: string;
  participants?: string[];
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
        location: "FC Köln Training Ground",
        type: "training",
        description: "Daily training session - 10:00 AM to 11:45 AM",
        participants: ["All Teams"]
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
    description: "Weekly house rules discussion and chore assignments"
  },
  {
    id: 1001,
    title: "Match vs Bayer Leverkusen U19",
    date: "2024-06-08",
    time: "14:00",
    location: "RheinEnergieSTADION",
    type: "match",
    description: "Youth league match"
  },
  {
    id: 1002,
    title: "Team Meeting",
    date: "2024-06-05",
    time: "16:00",
    location: "Conference Room",
    type: "meeting",
    description: "Weekly team strategy and review session"
  }
];

const sampleEvents: CalendarEvent[] = [...generatePracticeSessions(), ...additionalEvents];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [events] = useState<CalendarEvent[]>(sampleEvents);
  const [isExcuseModalOpen, setIsExcuseModalOpen] = useState(false);

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "training":
        return "bg-blue-100 text-blue-800";
      case "match":
        return "bg-red-100 text-red-800";
      case "meeting":
        return "bg-purple-100 text-purple-800";
      case "house":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-fc-dark">Calendar</h1>
            <p className="text-gray-600 mt-2">Manage training sessions, matches, and house events</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsExcuseModalOpen(true)}
              variant="outline" 
              className="border-fc-red text-fc-red hover:bg-fc-red hover:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Request Practice Excuse
            </Button>
            <Button className="bg-fc-red hover:bg-fc-red/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Widget */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-fc-red" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fc-red focus:border-transparent"
              />
              
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Training Sessions</span>
                    <Badge variant="outline" className="text-blue-600">
                      {events.filter(e => e.type === "training").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Matches</span>
                    <Badge variant="outline" className="text-red-600">
                      {events.filter(e => e.type === "match").length}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">House Events</span>
                    <Badge variant="outline" className="text-green-600">
                      {events.filter(e => e.type === "house").length}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Events for {formatDate(selectedDate)}</CardTitle>
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
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {event.time}
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
                      
                      {event.description && (
                        <p className="text-gray-600 text-sm">{event.description}</p>
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
              {events.slice(0, 6).map((event) => (
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
                  
                  <div className="text-xs text-gray-600 space-y-1">
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}