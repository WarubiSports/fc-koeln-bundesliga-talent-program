import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExcuseStats {
  totalExcuses: number;
  pendingExcuses: number;
  approvedExcuses: number;
  deniedExcuses: number;
  excusesByReason: Record<string, number>;
}

interface Excuse {
  id: number;
  playerName: string;
  date: string;
  reason: string;
  status: "pending" | "approved" | "denied";
  submittedAt: string;
}

export default function ExcuseStats() {
  const { data: stats } = useQuery<ExcuseStats>({
    queryKey: ["/api/excuse-stats"],
  });

  const { data: excuses } = useQuery<Excuse[]>({
    queryKey: ["/api/excuses"],
  });

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium bg-gray-200 h-4 w-20 rounded"></CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-200 h-8 w-16 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 w-24 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const recentExcuses = excuses?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExcuses}</div>
            <p className="text-xs text-muted-foreground">
              All excuse requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingExcuses}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approvedExcuses}</div>
            <p className="text-xs text-muted-foreground">
              Accepted requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.deniedExcuses}</div>
            <p className="text-xs text-muted-foreground">
              Rejected requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Excuse Reasons
            </CardTitle>
            <CardDescription>
              Distribution of excuse reasons
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(stats.excusesByReason).map(([reason, count]) => (
              <div key={reason} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{reason}</span>
                <Badge variant="outline">{count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>
              Latest excuse requests from players
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExcuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent requests</p>
              ) : (
                recentExcuses.map((excuse) => (
                  <div key={excuse.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{excuse.playerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {excuse.date} • {excuse.reason}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        excuse.status === "approved" ? "default" :
                        excuse.status === "denied" ? "destructive" : "secondary"
                      }
                    >
                      {excuse.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}