import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fc-red/5 to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0iI0RDMjYyNiIvPgo8cGF0aCBkPSJNMjQgMjRINTZWMzJIMjRWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQgMzZINTZWNDRIMjRWMzZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQgNDhINTZWNTZIMjRWNDhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K"
              alt="FC Köln Logo" 
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            1.FC Köln International Talent Program
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional player management and team coordination system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-fc-red/10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-user-shield text-fc-red"></i>
                </div>
                Admin Access
              </CardTitle>
              <CardDescription>
                Full administrative control for coaches and staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Manage player roster and information</li>
                <li>• Schedule training sessions and matches</li>
                <li>• Review practice excuse requests</li>
                <li>• Oversee house management and chores</li>
                <li>• Access analytics and reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-fc-red/10 rounded-lg flex items-center justify-center mr-3">
                  <i className="fas fa-futbol text-fc-red"></i>
                </div>
                Player Access
              </CardTitle>
              <CardDescription>
                Essential tools for talented players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• View training schedule and events</li>
                <li>• Submit practice excuse requests</li>
                <li>• Check assigned chores and tasks</li>
                <li>• Access personal calendar</li>
                <li>• Update availability status</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block">
            <CardHeader>
              <CardTitle className="text-2xl text-fc-red mb-2">Ready to Access?</CardTitle>
              <CardDescription>
                Sign in with your account to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-fc-red hover:bg-fc-red/90 text-white px-8 py-3 text-lg"
                size="lg"
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                Sign In
              </Button>
              <p className="text-xs text-gray-500 mt-4">
                Your access level will be automatically determined based on your account
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-fc-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-users text-fc-red text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Management</h3>
              <p className="text-sm text-gray-600">Comprehensive player profiles and team coordination</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-fc-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar text-fc-red text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-600">Practice sessions, matches, and excuse management</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-fc-red/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-home text-fc-red text-xl"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">House Coordination</h3>
              <p className="text-sm text-gray-600">Widdersdorf housing management and task assignment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}