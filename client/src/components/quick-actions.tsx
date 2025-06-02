import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface QuickActionsProps {
  onAddPlayer: () => void;
}

export default function QuickActions({ onAddPlayer }: QuickActionsProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-fc-dark">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {isAdmin && (
          <Button
            onClick={onAddPlayer}
            variant="outline"
            className="w-full justify-start p-4 h-auto border-gray-200 hover:border-fc-red hover:bg-red-50 transition-colors"
          >
            <div className="w-10 h-10 bg-fc-red bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
              <i className="fas fa-user-plus text-fc-red"></i>
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Add New Player</p>
              <p className="text-sm text-gray-600">Register a new talent to the program</p>
            </div>
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full justify-start p-4 h-auto border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="w-10 h-10 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-users text-blue-500"></i>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Create Team</p>
            <p className="text-sm text-gray-600">Organize players into teams</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start p-4 h-auto border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <div className="w-10 h-10 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center mr-4">
            <i className="fas fa-chart-bar text-green-500"></i>
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900">Performance Report</p>
            <p className="text-sm text-gray-600">Generate analytics and insights</p>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}
