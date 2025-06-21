import { storage } from "./storage";

export interface HouseCompetitionScore {
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

export interface CompetitionActivity {
  id: string;
  house: string;
  activity: string;
  points: number;
  category: string;
  date: Date;
  description: string;
  recordedBy: string;
}

export class HouseCompetitionEngine {
  // Point values for different activities
  private readonly pointSystem = {
    choreCompletion: {
      completed: 10,
      completedEarly: 15,
      perfectWeek: 50, // All chores completed by all house members
    },
    punctuality: {
      onTime: 5,
      early: 10,
      attendance: 15, // Perfect attendance for a week
    },
    teamwork: {
      helpingOthers: 20,
      groupProject: 25,
      conflictResolution: 30,
    },
    cleanliness: {
      dailyUpkeep: 5,
      deepClean: 15,
      inspection: 25, // Passing surprise cleanliness inspection
    },
    participation: {
      volunteerEvent: 20,
      communityService: 30,
      culturalActivity: 15,
    }
  };

  // Calculate chore completion scores for a house
  private async calculateChoreCompletionScore(house: string, timeframe: 'week' | 'month'): Promise<number> {
    try {
      const startDate = timeframe === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const houseChores = await storage.getChoresByHouse(house);
      const recentChores = houseChores.filter(chore => 
        new Date(chore.createdAt || 0) >= startDate
      );

      if (recentChores.length === 0) return 0;

      const completedChores = recentChores.filter(chore => chore.status === 'completed');
      const completionRate = completedChores.length / recentChores.length;

      // Base points for completion rate
      let points = Math.floor(completionRate * 100);

      // Bonus points for early completion
      const earlyCompletions = completedChores.filter(chore => {
        if (!chore.dueDate || !chore.updatedAt) return false;
        return new Date(chore.updatedAt) < new Date(chore.dueDate);
      });

      points += earlyCompletions.length * this.pointSystem.choreCompletion.completedEarly;

      // Perfect week bonus
      if (timeframe === 'week' && completionRate === 1.0) {
        points += this.pointSystem.choreCompletion.perfectWeek;
      }

      return points;
    } catch (error) {
      console.error(`Error calculating chore completion score for ${house}:`, error);
      return 0;
    }
  }

  // Calculate punctuality scores based on event attendance
  private async calculatePunctualityScore(house: string, timeframe: 'week' | 'month'): Promise<number> {
    try {
      const startDate = timeframe === 'week' 
        ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // This would need integration with actual attendance tracking
      // For now, we'll simulate based on events and player participation
      const events = await storage.getAllEvents();
      const recentEvents = events.filter(event => 
        new Date(event.date) >= startDate
      );

      const houseEvents = recentEvents.filter(event => 
        event.participants?.includes(house) || 
        event.participants?.toLowerCase().includes('all')
      );

      // Simplified scoring - would need actual attendance data
      return houseEvents.length * this.pointSystem.punctuality.attendance;
    } catch (error) {
      console.error(`Error calculating punctuality score for ${house}:`, error);
      return 0;
    }
  }

  // Get competition activities for a house
  async getHouseActivities(house: string, days: number = 30): Promise<CompetitionActivity[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get chore completions as activities
      const chores = await storage.getChoresByHouse(house);
      const recentChores = chores.filter(chore => 
        chore.status === 'completed' && 
        new Date(chore.updatedAt || 0) >= startDate
      );

      const activities: CompetitionActivity[] = recentChores.map(chore => ({
        id: `chore-${chore.id}`,
        house,
        activity: `Completed: ${chore.title}`,
        points: this.pointSystem.choreCompletion.completed,
        category: 'choreCompletion',
        date: new Date(chore.updatedAt || 0),
        description: chore.description || '',
        recordedBy: chore.assignedTo || 'System'
      }));

      // Add other activities (events, achievements, etc.)
      // This could be expanded with more data sources

      return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error(`Error getting activities for ${house}:`, error);
      return [];
    }
  }

  // Calculate comprehensive house scores
  async calculateHouseScores(): Promise<HouseCompetitionScore[]> {
    const houses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
    const scores: HouseCompetitionScore[] = [];

    for (const house of houses) {
      try {
        // Calculate category scores
        const choreScore = await this.calculateChoreCompletionScore(house, 'month');
        const weeklyChoreScore = await this.calculateChoreCompletionScore(house, 'week');
        const punctualityScore = await this.calculatePunctualityScore(house, 'month');
        const weeklyPunctualityScore = await this.calculatePunctualityScore(house, 'week');

        // Simplified scores for other categories (can be enhanced with real data)
        const teamworkScore = Math.floor(Math.random() * 50) + 50; // Placeholder
        const cleanlinessScore = Math.floor(Math.random() * 40) + 60; // Placeholder
        const participationScore = Math.floor(Math.random() * 45) + 55; // Placeholder

        const categories = {
          choreCompletion: choreScore,
          punctuality: punctualityScore,
          teamwork: teamworkScore,
          cleanliness: cleanlinessScore,
          participation: participationScore
        };

        const totalPoints = Object.values(categories).reduce((sum, points) => sum + points, 0);
        const weeklyPoints = weeklyChoreScore + weeklyPunctualityScore;

        // Generate achievements
        const achievements: string[] = [];
        if (categories.choreCompletion > 150) achievements.push('Chore Champions');
        if (categories.punctuality > 100) achievements.push('Always On Time');
        if (weeklyPoints > 200) achievements.push('Week Winners');
        if (totalPoints > 400) achievements.push('House Excellence');

        // Determine badge
        let badge = '';
        if (totalPoints > 450) badge = '🏆 Gold House';
        else if (totalPoints > 350) badge = '🥈 Silver House';
        else if (totalPoints > 250) badge = '🥉 Bronze House';

        scores.push({
          house,
          totalPoints,
          monthlyPoints: totalPoints,
          weeklyPoints,
          categories,
          rank: 0, // Will be set after sorting
          badge,
          achievements
        });
      } catch (error) {
        console.error(`Error calculating scores for ${house}:`, error);
        scores.push({
          house,
          totalPoints: 0,
          monthlyPoints: 0,
          weeklyPoints: 0,
          categories: {
            choreCompletion: 0,
            punctuality: 0,
            teamwork: 0,
            cleanliness: 0,
            participation: 0
          },
          rank: 0,
          achievements: []
        });
      }
    }

    // Sort by total points and assign ranks
    scores.sort((a, b) => b.totalPoints - a.totalPoints);
    scores.forEach((score, index) => {
      score.rank = index + 1;
    });

    return scores;
  }

  // Get leaderboard with detailed breakdown
  async getLeaderboard(): Promise<{
    overall: HouseCompetitionScore[];
    weekly: HouseCompetitionScore[];
    lastUpdated: Date;
    nextCompetition: string;
    seasonProgress: number;
  }> {
    const overallScores = await this.calculateHouseScores();
    
    // Weekly leaderboard (simplified for now)
    const weeklyScores = overallScores.map(score => ({
      ...score,
      totalPoints: score.weeklyPoints,
      monthlyPoints: score.weeklyPoints
    })).sort((a, b) => b.totalPoints - a.totalPoints);

    weeklyScores.forEach((score, index) => {
      score.rank = index + 1;
    });

    // Calculate season progress (assuming 10-month season)
    const seasonStart = new Date(2024, 8, 1); // September 1st
    const seasonEnd = new Date(2025, 6, 31); // July 31st
    const now = new Date();
    const totalDuration = seasonEnd.getTime() - seasonStart.getTime();
    const elapsed = Math.max(0, now.getTime() - seasonStart.getTime());
    const seasonProgress = Math.min(100, (elapsed / totalDuration) * 100);

    return {
      overall: overallScores,
      weekly: weeklyScores,
      lastUpdated: new Date(),
      nextCompetition: 'Monthly House Cup - December 2024',
      seasonProgress
    };
  }

  // Award points for specific activities
  async awardPoints(
    house: string, 
    category: keyof typeof this.pointSystem,
    activity: string,
    points: number,
    description: string,
    recordedBy: string
  ): Promise<CompetitionActivity> {
    const activityRecord: CompetitionActivity = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      house,
      activity,
      points,
      category,
      date: new Date(),
      description,
      recordedBy
    };

    // In a real implementation, this would be stored in the database
    console.log('Points awarded:', activityRecord);

    return activityRecord;
  }

  // Get house competition statistics
  async getCompetitionStats(): Promise<{
    totalActivities: number;
    totalPointsAwarded: number;
    mostActiveHouse: string;
    averageWeeklyPoints: number;
    competitionTrends: {
      house: string;
      weeklyTrend: number; // Positive = improving, negative = declining
    }[];
  }> {
    try {
      const houses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
      const allActivities: CompetitionActivity[] = [];
      const competitionTrends: { house: string; weeklyTrend: number }[] = [];

      for (const house of houses) {
        const activities = await this.getHouseActivities(house, 30);
        allActivities.push(...activities);

        // Calculate trend (comparing last 2 weeks)
        const lastWeek = activities.filter(a => 
          a.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        const previousWeek = activities.filter(a => 
          a.date >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) &&
          a.date < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );

        const lastWeekPoints = lastWeek.reduce((sum, a) => sum + a.points, 0);
        const previousWeekPoints = previousWeek.reduce((sum, a) => sum + a.points, 0);
        const trend = previousWeekPoints > 0 
          ? ((lastWeekPoints - previousWeekPoints) / previousWeekPoints) * 100
          : 0;

        competitionTrends.push({ house, weeklyTrend: trend });
      }

      const totalPointsAwarded = allActivities.reduce((sum, a) => sum + a.points, 0);
      const averageWeeklyPoints = totalPointsAwarded / Math.max(houses.length * 4, 1); // 4 weeks

      // Find most active house
      const houseActivityCounts = houses.map(house => ({
        house,
        count: allActivities.filter(a => a.house === house).length
      }));
      const mostActiveHouse = houseActivityCounts.reduce((max, current) => 
        current.count > max.count ? current : max
      ).house;

      return {
        totalActivities: allActivities.length,
        totalPointsAwarded,
        mostActiveHouse,
        averageWeeklyPoints,
        competitionTrends
      };
    } catch (error) {
      console.error('Error getting competition stats:', error);
      return {
        totalActivities: 0,
        totalPointsAwarded: 0,
        mostActiveHouse: 'Widdersdorf 1',
        averageWeeklyPoints: 0,
        competitionTrends: []
      };
    }
  }
}

export const houseCompetition = new HouseCompetitionEngine();