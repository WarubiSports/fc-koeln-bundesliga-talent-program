import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Users, BarChart3, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChoreAssignment {
  choreType: string;
  playerId: string;
  playerName: string;
  score: number;
}

interface OptimalAssignments {
  assignments: ChoreAssignment[];
  explanation: string[];
}

interface PlayerChoreHistory {
  playerId: string;
  playerName: string;
  house: string;
  totalChoresCompleted: number;
  totalChoresAssigned: number;
  completionRate: number;
  lastChoreDate: Date | null;
  choreTypes: { [choreType: string]: number };
  averageRating: number;
}

interface FairnessReport {
  overallFairness: number;
  houseReports: {
    [house: string]: {
      fairnessScore: number;
      playerStats: PlayerChoreHistory[];
      recommendations: string[];
    }
  };
}

export function SmartChoreRotation() {
  const [selectedHouse, setSelectedHouse] = useState<string>("Widdersdorf 1");
  const { toast } = useToast();

  const { data: optimalAssignments, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery<OptimalAssignments>({
    queryKey: ["/api/chore-rotation/optimal-assignments", selectedHouse],
    enabled: !!selectedHouse
  });

  const { data: fairnessReport, isLoading: reportLoading } = useQuery<FairnessReport>({
    queryKey: ["/api/chore-rotation/fairness-report"],
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const generateWeeklyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/chore-rotation/generate-weekly", "POST");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chore-rotation"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chores"] });
      toast({
        title: "Weekly Assignments Generated",
        description: "Smart chore rotation has created optimal assignments for all houses",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate weekly assignments",
        variant: "destructive",
      });
    },
  });

  const houses = ["Widdersdorf 1", "Widdersdorf 2", "Widdersdorf 3"];

  const getFairnessColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getFairnessIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <Clock className="w-4 h-4 text-yellow-600" />;
    return <AlertTriangle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="w-5 h-5" />
            Smart Chore Rotation
          </CardTitle>
          <CardDescription className="text-blue-700">
            AI-powered fair distribution system based on workload, experience, and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedHouse} onValueChange={setSelectedHouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select house" />
                </SelectTrigger>
                <SelectContent>
                  {houses.map(house => (
                    <SelectItem key={house} value={house}>{house}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => refetchAssignments()}
              variant="outline"
              size="sm"
              disabled={assignmentsLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${assignmentsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => generateWeeklyMutation.mutate()}
              disabled={generateWeeklyMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {generateWeeklyMutation.isPending ? 'Generating...' : 'Generate Weekly'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Optimal Assignments</TabsTrigger>
          <TabsTrigger value="fairness">Fairness Report</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Optimal Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommended Assignments for {selectedHouse}</CardTitle>
              <CardDescription>
                Optimized based on fairness, skill level, and recent activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : optimalAssignments?.assignments ? (
                <div className="space-y-4">
                  {optimalAssignments.assignments.map((assignment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{assignment.choreType}</h4>
                        <p className="text-sm text-gray-600">Assigned to: {assignment.playerName}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Score: {assignment.score.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No assignments available</p>
              )}

              {/* Algorithm Explanation */}
              {optimalAssignments?.explanation && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Algorithm Reasoning</h5>
                  <div className="space-y-1 text-sm text-blue-700">
                    {optimalAssignments.explanation.map((explanation, index) => (
                      <div key={index}>{explanation}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fairness Report Tab */}
        <TabsContent value="fairness" className="space-y-4">
          {fairnessReport && (
            <>
              {/* Overall Fairness Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Overall Fairness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getFairnessColor(fairnessReport.overallFairness)}`}>
                      {Math.round(fairnessReport.overallFairness)}%
                    </div>
                    <Progress value={fairnessReport.overallFairness} className="mt-2" />
                    <p className="text-sm text-gray-600 mt-2">
                      System-wide chore distribution fairness
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* House Reports */}
              <div className="grid gap-4">
                {Object.entries(fairnessReport.houseReports).map(([house, report]) => (
                  <Card key={house}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {house}
                        <div className="flex items-center gap-2">
                          {getFairnessIcon(report.fairnessScore)}
                          <span className={`font-bold ${getFairnessColor(report.fairnessScore)}`}>
                            {Math.round(report.fairnessScore)}%
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Player Statistics */}
                      <div className="space-y-3 mb-4">
                        {report.playerStats.map((player) => (
                          <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{player.playerName}</div>
                              <div className="text-sm text-gray-600">
                                {player.totalChoresAssigned} assigned • {Math.round(player.completionRate * 100)}% completed
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                Rating: {player.averageRating}/5
                              </div>
                              <div className="text-xs text-gray-500">
                                Last: {player.lastChoreDate 
                                  ? new Date(player.lastChoreDate).toLocaleDateString()
                                  : 'Never'
                                }
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Recommendations */}
                      {report.recommendations.length > 0 && (
                        <div className="border-t pt-4">
                          <h6 className="font-medium mb-2">Recommendations</h6>
                          <div className="space-y-1 text-sm text-gray-700">
                            {report.recommendations.map((rec, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rotation Analytics</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h5 className="font-medium">Algorithm Configuration</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Fairness Weight: 60%</div>
                    <div>Skill Weight: 20%</div>
                    <div>Availability Weight: 20%</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Rotation Frequency</h5>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Schedule: Weekly</div>
                    <div>Auto-generation: Enabled</div>
                    <div>Manual Override: Available</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}