import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface ChoreStats {
  totalChores: number;
  pendingChores: number;
  completedChores: number;
  overdueChores: number;
}

export default function ChoreStats() {
  const { data: stats, isLoading } = useQuery<ChoreStats>({
    queryKey: ["/api/chores/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Failed to load chore statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Chores</p>
              <p className="text-3xl font-bold text-fc-dark">{stats.totalChores}</p>
            </div>
            <div className="w-12 h-12 bg-fc-red bg-opacity-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-fc-red text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-fc-success font-medium">All tasks</span>
            <span className="text-gray-600 ml-1">in the system</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-fc-dark">{stats.pendingChores}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-clock text-yellow-500 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600 font-medium">Waiting</span>
            <span className="text-gray-600 ml-1">to be started</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-fc-dark">{stats.completedChores}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-check text-green-500 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-fc-success font-medium">Finished</span>
            <span className="text-gray-600 ml-1">tasks</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-3xl font-bold text-fc-dark">{stats.overdueChores}</p>
            </div>
            <div className="w-12 h-12 bg-red-500 bg-opacity-10 rounded-lg flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">Past due</span>
            <span className="text-gray-600 ml-1">date</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}