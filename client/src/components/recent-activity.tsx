import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecentActivity() {
  // In a real app, this would come from an API
  const activities = [
    {
      id: 1,
      type: "player_added",
      icon: "fas fa-user-plus",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      message: "New player registration completed",
      description: "Player profile created and assigned to U18 squad",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "performance_update",
      icon: "fas fa-edit",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      message: "Performance metrics updated",
      description: "Monthly assessment scores recorded",
      time: "5 hours ago",
    },
    {
      id: 3,
      type: "scout_report",
      icon: "fas fa-star",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      message: "New talent scout report received",
      description: "Potential recruit identified in regional tournament",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "analytics",
      icon: "fas fa-chart-line",
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
      message: "Monthly performance report generated",
      description: "Team statistics and player development metrics compiled",
      time: "2 days ago",
    },
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-fc-dark">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                <i className={`${activity.icon} ${activity.iconColor} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium">
                  {activity.message}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button
            variant="ghost"
            className="w-full text-center text-fc-red font-medium hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            View all activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
