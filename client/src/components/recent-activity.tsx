import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { UserPlus, ShoppingCart, Calendar, MessageSquare, Home, ClipboardCheck } from "lucide-react";

interface Activity {
  id: string;
  type: string;
  message: string;
  description: string;
  createdAt: string;
  playerName?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'player_registered':
      return { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' };
    case 'food_order':
      return { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' };
    case 'event_created':
      return { icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' };
    case 'message_sent':
      return { icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-100' };
    case 'chore_assigned':
      return { icon: ClipboardCheck, color: 'text-orange-600', bg: 'bg-orange-100' };
    case 'house_assignment':
      return { icon: Home, color: 'text-teal-600', bg: 'bg-teal-100' };
    default:
      return { icon: UserPlus, color: 'text-gray-600', bg: 'bg-gray-100' };
  }
};

export default function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/recent-activities"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-fc-dark">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-fc-dark">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activities</p>
            </div>
          ) : (
            activities.map((activity) => {
              const iconConfig = getActivityIcon(activity.type);
              const IconComponent = iconConfig.icon;
              
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${iconConfig.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`h-4 w-4 ${iconConfig.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activities.length > 0 && (
          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full text-center text-fc-red font-medium hover:text-red-700 hover:bg-red-50 transition-colors"
            >
              View all activity
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
