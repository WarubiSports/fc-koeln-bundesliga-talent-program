import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface ExcuseStats {
  totalExcuses: number;
  pendingExcuses: number;
  approvedExcuses: number;
  deniedExcuses: number;
  excusesByReason: Record<string, number>;
}

interface PracticeExcuse {
  id: number;
  playerName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  submittedAt: string;
}

export default function PracticeExcuseStats() {
  const { data: stats } = useQuery<ExcuseStats>({
    queryKey: ["/api/practice-excuse-stats"],
    queryFn: async () => {
      const response = await fetch("/api/practice-excuse-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    }
  });

  const { data: excuses } = useQuery<PracticeExcuse[]>({
    queryKey: ["/api/practice-excuses"],
    queryFn: async () => {
      const response = await fetch("/api/practice-excuses");
      if (!response.ok) throw new Error("Failed to fetch excuses");
      return response.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "denied":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "default" as const;
      case "denied":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Excuses</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExcuses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingExcuses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedExcuses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deniedExcuses}</div>
          </CardContent>
        </Card>
      </div>

      {excuses && excuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Practice Excuses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {excuses.slice(0, 5).map((excuse) => (
                <div key={excuse.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{excuse.playerName}</span>
                      <Badge variant={getStatusVariant(excuse.status)}>
                        {excuse.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{excuse.date}</p>
                    <p className="text-sm text-gray-500 mt-1">{excuse.reason}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(excuse.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.excusesByReason && Object.keys(stats.excusesByReason).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Excuse Reasons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.excusesByReason).map(([reason, count]) => (
                <div key={reason} className="flex justify-between items-center">
                  <span className="text-sm">{reason}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}