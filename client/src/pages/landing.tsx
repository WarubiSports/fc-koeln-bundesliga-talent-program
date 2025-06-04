import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Home, MessageSquare } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://germany-socceracademy.com/wp-content/uploads/2023/09/NewCologneLogo.png" 
              alt="FC Köln Football School" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            1.FC Köln International Talent Program
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Managing excellence in football development
          </p>
          <Button size="lg" asChild>
            <a href="/api/login">
              Sign In to Continue
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                Player Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Track player profiles, performance, and development progress.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Training Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Manage training sessions, matches, and team events.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-red-600" />
                Housing Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Coordinate housing arrangements and facilities.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-600" />
                Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Stay connected with team updates and announcements.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}