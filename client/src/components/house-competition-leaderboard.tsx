import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface HouseScore {
  house: string;
  totalPoints: number;
  monthlyPoints: number;
  weeklyPoints: number;
  categories: {
    choreCompletion: number;
    punctuality: number;
    teamwork: number;
    cleanliness: number;
    participation: number;
  };
  rank: number;
  badge?: string;
  achievements: string[];
}

interface Leaderboard {
  overall: HouseScore[];
  weekly: HouseScore[];
  lastUpdated: Date;
  nextCompetition: string;
  seasonProgress: number;
}

interface CompetitionStats {
  totalActivities: number;
  totalPointsAwarded: number;
  mostActiveHouse: string;
  averageWeeklyPoints: number;
  competitionTrends: {
    house: string;
    weeklyTrend: number;
  }[];
}

export function HouseCompetitionLeaderboard() {
  const { data: leaderboard, isLoading } = useQuery<Leaderboard>({
    queryKey: ["/api/house-competition/leaderboard"],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: stats } = useQuery<CompetitionStats>({
    queryKey: ["/api/house-competition/stats"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid gap-6">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Unable to load competition data</p>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-semibold">{rank}</span>;
    }
  };

  const getTrendIcon = (house: string) => {
    const trend = stats?.competitionTrends.find(t => t.house === house);
    if (!trend) return <Minus className="w-4 h-4 text-gray-400" />;
    
    if (trend.weeklyTrend > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.weeklyTrend < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Competition Overview */}
      <Card className="bg-gradient-to-r from-fc-red/10 to-fc-red/5 border-fc-red/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fc-dark">
            <Trophy className="w-5 h-5 text-fc-red" />
            House Competition
          </CardTitle>
          <CardDescription>
            Season Progress • {leaderboard.nextCompetition}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Season Progress</span>
                <span>{Math.round(leaderboard.seasonProgress)}%</span>
              </div>
              <Progress value={leaderboard.seasonProgress} className="h-2" />
            </div>
            
            {stats && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-fc-red">{stats.totalActivities}</div>
                  <div className="text-xs text-gray-600">Total Activities</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-fc-red">{stats.totalPointsAwarded}</div>
                  <div className="text-xs text-gray-600">Points Awarded</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-fc-red">{stats.mostActiveHouse}</div>
                  <div className="text-xs text-gray-600">Most Active</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overall Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Standings</CardTitle>
          <CardDescription>Season-long performance across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.overall.map((house) => (
              <div 
                key={house.house}
                className={`p-4 rounded-lg border transition-all ${
                  house.rank === 1 
                    ? 'bg-yellow-50 border-yellow-200 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getRankIcon(house.rank)}
                    <div>
                      <h3 className="font-semibold text-lg">{house.house}</h3>
                      {house.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {house.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-fc-red">{house.totalPoints}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      {getTrendIcon(house.house)}
                      Monthly Points
                    </div>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div>
                    <div className="font-medium text-gray-700">Chores</div>
                    <div className="text-fc-red font-semibold">{house.categories.choreCompletion}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Punctuality</div>
                    <div className="text-fc-red font-semibold">{house.categories.punctuality}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Teamwork</div>
                    <div className="text-fc-red font-semibold">{house.categories.teamwork}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Cleanliness</div>
                    <div className="text-fc-red font-semibold">{house.categories.cleanliness}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Participation</div>
                    <div className="text-fc-red font-semibold">{house.categories.participation}</div>
                  </div>
                </div>

                {/* Achievements */}
                {house.achievements.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {house.achievements.map((achievement, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs border-fc-red/30 text-fc-red"
                      >
                        {achievement}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>This Week</CardTitle>
          <CardDescription>Current week performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.weekly.map((house) => (
              <div 
                key={house.house}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(house.rank)}
                  <span className="font-medium">{house.house}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-fc-red">{house.weeklyPoints}</div>
                  <div className="text-xs text-gray-500">Week Points</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(leaderboard.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
}