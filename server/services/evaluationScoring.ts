// Evaluation Scoring Service
// Computes score, bucket, rating, and tags for player evaluations

export interface EvaluationInput {
  // Step 1: Basic Info
  fullName: string;
  yearOfBirth: number;
  gradYear?: number;
  primaryPositions: string[];
  secondaryPositions?: string[];
  dominantFoot: string;
  
  // Step 2: Club & League Context
  currentClub: string;
  currentLeague: string;
  ageGroup: string;
  stateRegion: string;
  
  // Step 3: Playing Profile
  height: number;
  weight: number;
  primaryStrengths?: string[];
  areasToImprove?: string[];
  
  // Step 4: Experience & Stats
  yearsAtCurrentLevel: number;
  previousClubs?: string[];
  seasonAppearances: number;
  seasonStarts: number;
  seasonGoals: number;
  seasonAssists: number;
  notableAchievements?: string[];
  hasNationalTeamExperience: boolean;
  hasProAcademyExperience: boolean;
  
  // Step 5: Aspirations & Context
  mainGoals: string[];
  preferredRegion: string;
  readinessTimeline: string;
}

export interface EvaluationResult {
  score: number;
  bucket: 'A' | 'B' | 'C' | 'D';
  rating: string;
  tags: string[];
}

// League tier rankings (higher = better)
const LEAGUE_TIERS: Record<string, number> = {
  'MLS NEXT': 100,
  'ECNL': 95,
  'GA': 90,
  'USL Academy': 85,
  'E64': 80,
  'PPL': 75,
  'NPL': 70,
  'UPSL Youth': 60,
  'Other': 50,
};

// Position categories for tag generation
const POSITION_CATEGORIES: Record<string, string[]> = {
  'Goalkeeper': ['GK'],
  'Defender': ['CB', 'LB', 'RB', 'LCB', 'RCB', 'SW'],
  'Midfielder': ['CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW'],
  'Forward': ['ST', 'CF', 'LW', 'RW', 'SS'],
};

function getAgeFromBirthYear(yearOfBirth: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - yearOfBirth;
}

function calculateLeagueScore(league: string): number {
  return LEAGUE_TIERS[league] || LEAGUE_TIERS['Other'];
}

function calculateAgeAppropriatenessScore(yearOfBirth: number, ageGroup: string, yearsAtLevel: number): number {
  const age = getAgeFromBirthYear(yearOfBirth);
  const expectedAge = parseInt(ageGroup.replace('U', '')) - 1;
  
  let score = 50;
  
  // Playing up is a positive indicator
  if (age < expectedAge) {
    score += (expectedAge - age) * 10;
  }
  
  // Years at current level shows development
  score += Math.min(yearsAtLevel * 5, 20);
  
  return Math.min(score, 100);
}

function calculateStatsScore(appearances: number, starts: number, goals: number, assists: number, positions: string[]): number {
  let score = 0;
  
  // Appearances and starts
  const startRatio = appearances > 0 ? (starts / appearances) : 0;
  score += Math.min(appearances * 2, 30);
  score += startRatio * 20;
  
  // Goals and assists weighted by position
  const isForward = positions.some(p => 
    POSITION_CATEGORIES['Forward']?.includes(p.toUpperCase()) || 
    p.toLowerCase().includes('forward') || 
    p.toLowerCase().includes('striker')
  );
  const isMidfielder = positions.some(p => 
    POSITION_CATEGORIES['Midfielder']?.includes(p.toUpperCase()) || 
    p.toLowerCase().includes('midfielder')
  );
  const isDefender = positions.some(p => 
    POSITION_CATEGORIES['Defender']?.includes(p.toUpperCase()) || 
    p.toLowerCase().includes('back') ||
    p.toLowerCase().includes('defender')
  );
  const isGoalkeeper = positions.some(p => 
    POSITION_CATEGORIES['Goalkeeper']?.includes(p.toUpperCase()) || 
    p.toLowerCase().includes('goalkeeper') ||
    p.toLowerCase().includes('keeper')
  );
  
  if (isForward) {
    score += Math.min(goals * 3, 30);
    score += Math.min(assists * 2, 15);
  } else if (isMidfielder) {
    score += Math.min(goals * 4, 25);
    score += Math.min(assists * 3, 25);
  } else if (isDefender) {
    score += Math.min(goals * 5, 15);
    score += Math.min(assists * 4, 20);
  } else if (isGoalkeeper) {
    // For goalkeepers, appearances matter more
    score += Math.min(appearances * 3, 50);
  }
  
  return Math.min(score, 100);
}

function calculateExperienceScore(
  hasNationalTeam: boolean, 
  hasProAcademy: boolean, 
  achievements: string[] = [],
  previousClubs: string[] = []
): number {
  let score = 40;
  
  if (hasNationalTeam) score += 25;
  if (hasProAcademy) score += 20;
  
  // Notable achievements
  score += Math.min(achievements.length * 5, 15);
  
  // Previous clubs (experience breadth)
  score += Math.min(previousClubs.length * 3, 10);
  
  return Math.min(score, 100);
}

function calculateAspirationScore(mainGoals: string[], preferredRegion: string, readiness: string, age: number): number {
  let score = 50;
  
  // Pro ambitions at right age
  const hasProGoal = mainGoals.includes('pro') || mainGoals.includes('Long-term pro ambitions');
  const hasCollegeGoal = mainGoals.includes('college') || mainGoals.includes('Play college soccer');
  const hasAbroadGoal = mainGoals.includes('abroad') || mainGoals.includes('Train/compete abroad');
  
  if (hasProGoal && age >= 15) score += 15;
  if (hasCollegeGoal && age >= 14 && age <= 18) score += 10;
  if (hasAbroadGoal) score += 10;
  
  // Readiness timeline
  if (readiness === '6-12 months') score += 15;
  else if (readiness === '1-2 years') score += 10;
  
  // International openness
  if (preferredRegion === 'Open' || preferredRegion === 'USA & Europe') score += 10;
  
  return Math.min(score, 100);
}

function generateTags(input: EvaluationInput, score: number): string[] {
  const tags: string[] = [];
  const age = getAgeFromBirthYear(input.yearOfBirth);
  
  // Position-based tags
  if (input.primaryPositions.length > 0) {
    const mainPosition = input.primaryPositions[0];
    tags.push(mainPosition);
  }
  
  // Versatility
  if (input.secondaryPositions && input.secondaryPositions.length >= 2) {
    tags.push('Versatile');
  }
  
  // Stats-based tags
  const totalGoalContributions = input.seasonGoals + input.seasonAssists;
  if (input.seasonGoals >= 10) tags.push('High Output Goal Scorer');
  else if (input.seasonGoals >= 5) tags.push('Consistent Scorer');
  
  if (input.seasonAssists >= 8) tags.push('Playmaker');
  else if (input.seasonAssists >= 4) tags.push('Creative');
  
  if (totalGoalContributions >= 15) tags.push('Elite Attacker');
  
  // Experience tags
  if (input.hasNationalTeamExperience) tags.push('National Team Experience');
  if (input.hasProAcademyExperience) tags.push('Pro Academy Trained');
  
  // League level tags
  const leagueTier = LEAGUE_TIERS[input.currentLeague] || 50;
  if (leagueTier >= 95) tags.push('Top-Tier League');
  else if (leagueTier >= 80) tags.push('High-Level Competition');
  
  // Physical tags (assuming height in inches)
  if (input.height >= 72) tags.push('Physical Presence');
  
  // Foot preference
  if (input.dominantFoot === 'both') tags.push('Two-Footed');
  
  // Age-based tags
  const expectedAge = parseInt(input.ageGroup.replace('U', '')) - 1;
  if (age < expectedAge) tags.push('Playing Up');
  
  // Strengths-based tags
  if (input.primaryStrengths) {
    input.primaryStrengths.slice(0, 2).forEach(strength => {
      const cleanStrength = strength.trim();
      if (cleanStrength.length > 2 && cleanStrength.length <= 25) {
        tags.push(cleanStrength);
      }
    });
  }
  
  // Aspiration tags
  if (input.mainGoals.some(g => g.includes('pro'))) tags.push('Pro Aspirations');
  if (input.mainGoals.some(g => g.includes('abroad'))) tags.push('International Ambitions');
  
  // Limit to 8 most relevant tags
  return [...new Set(tags)].slice(0, 8);
}

function determineBucket(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 75) return 'A';
  if (score >= 55) return 'B';
  if (score >= 35) return 'C';
  return 'D';
}

function determineRating(bucket: 'A' | 'B' | 'C' | 'D'): string {
  const ratings: Record<string, string> = {
    'A': 'Advanced Level',
    'B': 'Competitive Level',
    'C': 'Developing Level',
    'D': 'Emerging Level',
  };
  return ratings[bucket];
}

export function calculateEvaluation(input: EvaluationInput): EvaluationResult {
  const age = getAgeFromBirthYear(input.yearOfBirth);
  
  // Calculate component scores
  const leagueScore = calculateLeagueScore(input.currentLeague);
  const ageScore = calculateAgeAppropriatenessScore(input.yearOfBirth, input.ageGroup, input.yearsAtCurrentLevel);
  const statsScore = calculateStatsScore(
    input.seasonAppearances, 
    input.seasonStarts, 
    input.seasonGoals, 
    input.seasonAssists, 
    input.primaryPositions
  );
  const experienceScore = calculateExperienceScore(
    input.hasNationalTeamExperience,
    input.hasProAcademyExperience,
    input.notableAchievements,
    input.previousClubs
  );
  const aspirationScore = calculateAspirationScore(
    input.mainGoals,
    input.preferredRegion,
    input.readinessTimeline,
    age
  );
  
  // Weighted average
  const weights = {
    league: 0.25,
    age: 0.15,
    stats: 0.25,
    experience: 0.20,
    aspiration: 0.15,
  };
  
  const finalScore = Math.round(
    leagueScore * weights.league +
    ageScore * weights.age +
    statsScore * weights.stats +
    experienceScore * weights.experience +
    aspirationScore * weights.aspiration
  );
  
  const bucket = determineBucket(finalScore);
  const rating = determineRating(bucket);
  const tags = generateTags(input, finalScore);
  
  return {
    score: Math.min(Math.max(finalScore, 0), 100),
    bucket,
    rating,
    tags,
  };
}

// Export constants for frontend use
export const LEAGUES = [
  'MLS NEXT',
  'ECNL',
  'GA',
  'USL Academy',
  'E64',
  'PPL',
  'NPL',
  'UPSL Youth',
  'Other',
];

export const AGE_GROUPS = [
  'U13',
  'U14',
  'U15',
  'U16',
  'U17',
  'U18',
  'U19',
];

export const POSITIONS = [
  'Goalkeeper',
  'Center Back',
  'Left Back',
  'Right Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Left Winger',
  'Right Winger',
  'Striker',
  'Forward',
];

export const MAIN_GOALS = [
  'Play college soccer',
  'Train/compete abroad',
  'Long-term pro ambitions',
  'Improve within current youth level',
];

export const PREFERRED_REGIONS = [
  'USA only',
  'USA & Europe',
  'Europe preferred',
  'Open',
];

export const READINESS_TIMELINES = [
  '6-12 months',
  '1-2 years',
  '2+ years',
];
