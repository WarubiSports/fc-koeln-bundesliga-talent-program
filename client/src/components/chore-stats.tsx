import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChoreStats {
  totalChores: number;
  pendingChores: number;
  completedChores: number;
  overdueChores: number;
}

export default function ChoreStats() {
  const { data: stats, isLoading } = useQuery<ChoreStats>({
    queryKey: ["/api/chore-stats"],
  });

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const statItems = [
    {
      id: 1,
      icon: "fas fa-clipboard-list",
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      value: stats.totalChores,
      label: "Total Chores",
      description: "Across all houses"
    },
    {
      id: 2,
      icon: "fas fa-clock",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      value: stats.pendingChores,
      label: "Pending",
      description: "Waiting to start"
    },
    {
      id: 3,
      icon: "fas fa-check-circle",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      value: stats.completedChores,
      label: "Completed",
      description: "Finished tasks"
    },
    {
      id: 4,
      icon: "fas fa-exclamation-triangle",
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      value: stats.overdueChores,
      label: "Overdue",
      description: "Past due date"
    }
  ];

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-fc-dark flex items-center">
          <i className="fas fa-chart-bar text-fc-red mr-3"></i>
          Chore Statistics
        </CardTitle>
        <p className="text-gray-600">Overview of all house chores</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems.map((item) => (
            <div key={item.id} className="text-center">
              <div className={`w-16 h-16 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
                <i className={`${item.icon} ${item.iconColor} text-xl`}></i>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
              <div className="text-sm font-semibold text-gray-700 mb-1">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}