import { storage } from "./storage";

export interface ChoreRotationConfig {
  rotationFrequency: 'weekly' | 'biweekly' | 'monthly';
  fairnessWeight: number; // 0-1, how much to prioritize equal distribution
  skillWeight: number; // 0-1, how much to consider player skill/experience
  availabilityWeight: number; // 0-1, how much to consider player availability
}

export interface PlayerChoreHistory {
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

export class SmartChoreRotationEngine {
  private config: ChoreRotationConfig;

  constructor(config: ChoreRotationConfig = {
    rotationFrequency: 'weekly',
    fairnessWeight: 0.6,
    skillWeight: 0.2,
    availabilityWeight: 0.2
  }) {
    this.config = config;
  }

  // Calculate fairness score for a player (lower = more fair to assign)
  private calculateFairnessScore(history: PlayerChoreHistory, houseAverage: number): number {
    const choreLoad = history.totalChoresAssigned || 0;
    const fairnessGap = choreLoad - houseAverage;
    
    // Days since last chore (more days = lower score = more likely to be assigned)
    const daysSinceLastChore = history.lastChoreDate 
      ? (Date.now() - history.lastChoreDate.getTime()) / (1000 * 60 * 60 * 24)
      : 30; // If never assigned, treat as 30 days ago
    
    const timeFactor = Math.min(daysSinceLastChore / 7, 1); // Normalize to 0-1 over a week
    
    return fairnessGap - (timeFactor * 2); // Time factor reduces unfairness
  }

  // Calculate skill score for a chore type
  private calculateSkillScore(history: PlayerChoreHistory, choreType: string): number {
    const typeExperience = history.choreTypes[choreType] || 0;
    const totalExperience = history.totalChoresCompleted || 1;
    const completionRate = history.completionRate || 0;
    
    // Higher experience and completion rate = higher skill score
    return (typeExperience / totalExperience) * completionRate * history.averageRating;
  }

  // Get optimal chore assignments for a house
  async getOptimalChoreAssignments(house: string, choreTypes: string[]): Promise<{
    assignments: { choreType: string; playerId: string; playerName: string; score: number }[];
    explanation: string[];
  }> {
    try {
      // Get all players in the house
      const players = await storage.getPlayersByHouse(house);
      const playerHistories = await Promise.all(
        players.map(player => this.getPlayerChoreHistory(player.id.toString()))
      );

      // Calculate house averages
      const totalChores = playerHistories.reduce((sum, h) => sum + h.totalChoresAssigned, 0);
      const houseAverage = totalChores / Math.max(playerHistories.length, 1);

      const assignments: { choreType: string; playerId: string; playerName: string; score: number }[] = [];
      const explanation: string[] = [];

      // For each chore type, find the best player
      for (const choreType of choreTypes) {
        let bestPlayer: PlayerChoreHistory | null = null;
        let bestScore = Infinity;
        let scoreBreakdown = '';

        for (const history of playerHistories) {
          // Skip if player is already assigned a chore this round
          if (assignments.some(a => a.playerId === history.playerId)) {
            continue;
          }

          const fairnessScore = this.calculateFairnessScore(history, houseAverage);
          const skillScore = this.calculateSkillScore(history, choreType);
          
          // Availability score (simplified - could be enhanced with actual availability data)
          const availabilityScore = 1.0; // Assume all players are available for now

          // Weighted total score (lower is better for assignment)
          const totalScore = 
            (fairnessScore * this.config.fairnessWeight) +
            (-skillScore * this.config.skillWeight) + // Negative because higher skill is better
            (-availabilityScore * this.config.availabilityWeight);

          if (totalScore < bestScore) {
            bestScore = totalScore;
            bestPlayer = history;
            scoreBreakdown = `Fairness: ${fairnessScore.toFixed(2)}, Skill: ${skillScore.toFixed(2)}, Total: ${totalScore.toFixed(2)}`;
          }
        }

        if (bestPlayer) {
          assignments.push({
            choreType,
            playerId: bestPlayer.playerId,
            playerName: bestPlayer.playerName,
            score: bestScore
          });

          explanation.push(
            `${choreType} → ${bestPlayer.playerName}: ${scoreBreakdown}`
          );
        }
      }

      return { assignments, explanation };
    } catch (error) {
      console.error('Error calculating optimal chore assignments:', error);
      throw new Error('Failed to calculate chore assignments');
    }
  }

  // Get comprehensive chore history for a player
  private async getPlayerChoreHistory(playerId: string): Promise<PlayerChoreHistory> {
    try {
      // Get player info
      const player = await storage.getPlayer(parseInt(playerId));
      if (!player) {
        throw new Error(`Player ${playerId} not found`);
      }

      // Get chore history
      const playerChores = await storage.getChoresForUser(player.firstName + ' ' + player.lastName);
      
      // Calculate statistics
      const completedChores = playerChores.filter(c => c.status === 'completed');
      const totalAssigned = playerChores.length;
      const totalCompleted = completedChores.length;
      const completionRate = totalAssigned > 0 ? totalCompleted / totalAssigned : 0;

      // Group by chore types
      const choreTypes: { [key: string]: number } = {};
      playerChores.forEach(chore => {
        const type = chore.title.toLowerCase();
        choreTypes[type] = (choreTypes[type] || 0) + 1;
      });

      // Calculate average rating (simplified - could be enhanced with actual ratings)
      const averageRating = completionRate > 0.8 ? 5 : completionRate > 0.6 ? 4 : completionRate > 0.4 ? 3 : 2;

      // Find last chore date
      const sortedChores = playerChores.sort((a, b) => 
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      const lastChoreDate = sortedChores.length > 0 ? new Date(sortedChores[0].createdAt || 0) : null;

      return {
        playerId,
        playerName: `${player.firstName} ${player.lastName}`,
        house: player.house || '',
        totalChoresCompleted: totalCompleted,
        totalChoresAssigned: totalAssigned,
        completionRate,
        lastChoreDate,
        choreTypes,
        averageRating
      };
    } catch (error) {
      console.error(`Error getting chore history for player ${playerId}:`, error);
      return {
        playerId,
        playerName: 'Unknown Player',
        house: '',
        totalChoresCompleted: 0,
        totalChoresAssigned: 0,
        completionRate: 0,
        lastChoreDate: null,
        choreTypes: {},
        averageRating: 3
      };
    }
  }

  // Generate automatic chore assignments for all houses
  async generateWeeklyChoreAssignments(): Promise<{
    [house: string]: {
      assignments: { choreType: string; playerId: string; playerName: string }[];
      explanation: string[];
    }
  }> {
    const houses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
    const standardChores = [
      'Kitchen Cleaning',
      'Vacuum Common Areas',
      'Bathroom Cleaning',
      'Take Out Trash',
      'Laundry Room Maintenance'
    ];

    const results: any = {};

    for (const house of houses) {
      try {
        const houseAssignments = await this.getOptimalChoreAssignments(house, standardChores);
        results[house] = houseAssignments;
      } catch (error) {
        console.error(`Error generating assignments for ${house}:`, error);
        results[house] = { assignments: [], explanation: ['Error generating assignments'] };
      }
    }

    return results;
  }

  // Get fairness report for all houses
  async getFairnessReport(): Promise<{
    overallFairness: number;
    houseReports: {
      [house: string]: {
        fairnessScore: number;
        playerStats: PlayerChoreHistory[];
        recommendations: string[];
      }
    }
  }> {
    const houses = ['Widdersdorf 1', 'Widdersdorf 2', 'Widdersdorf 3'];
    const houseReports: any = {};
    let totalFairness = 0;

    for (const house of houses) {
      try {
        const players = await storage.getPlayersByHouse(house);
        const playerStats = await Promise.all(
          players.map(p => this.getPlayerChoreHistory(p.id.toString()))
        );

        // Calculate fairness score for the house
        const workloads = playerStats.map(p => p.totalChoresAssigned);
        const average = workloads.reduce((a, b) => a + b, 0) / Math.max(workloads.length, 1);
        const variance = workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) / Math.max(workloads.length, 1);
        const fairnessScore = Math.max(0, 100 - variance * 10); // Higher is more fair

        // Generate recommendations
        const recommendations: string[] = [];
        const maxWorkload = Math.max(...workloads);
        const minWorkload = Math.min(...workloads);
        
        if (maxWorkload - minWorkload > 3) {
          const overworked = playerStats.find(p => p.totalChoresAssigned === maxWorkload);
          const underworked = playerStats.find(p => p.totalChoresAssigned === minWorkload);
          recommendations.push(
            `Consider assigning fewer chores to ${overworked?.playerName} and more to ${underworked?.playerName}`
          );
        }

        // Check for low completion rates
        const lowPerformers = playerStats.filter(p => p.completionRate < 0.5 && p.totalChoresAssigned > 0);
        if (lowPerformers.length > 0) {
          recommendations.push(
            `Players with low completion rates need support: ${lowPerformers.map(p => p.playerName).join(', ')}`
          );
        }

        houseReports[house] = {
          fairnessScore,
          playerStats,
          recommendations
        };

        totalFairness += fairnessScore;
      } catch (error) {
        console.error(`Error generating fairness report for ${house}:`, error);
        houseReports[house] = {
          fairnessScore: 0,
          playerStats: [],
          recommendations: ['Error generating report']
        };
      }
    }

    return {
      overallFairness: totalFairness / houses.length,
      houseReports
    };
  }
}

export const choreRotationEngine = new SmartChoreRotationEngine();