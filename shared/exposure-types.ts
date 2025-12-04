export type YouthLeague =
  | "MLS_NEXT"
  | "ECNL"
  | "Girls_Academy"
  | "USL_Academy"
  | "USYS_National_League"
  | "ECNL_RL"
  | "High_School"
  | "Elite_Local"
  | "Other";

export type CollegeLevel = "D1" | "D2" | "D3" | "NAIA" | "JUCO";

export type Position =
  | "GK" | "CB" | "LB" | "RB" | "CDM" | "CM" | "CAM" | "LW" | "RW" | "ST";

export type ExperienceLevel = 
  | "Youth_Club_Only"
  | "High_School_Varsity"
  | "Adult_Amateur_League"
  | "Semi_Pro_UPSL_NPSL_WPSL"
  | "International_Academy_U19"
  | "Pro_Academy_Reserve";

export interface SeasonStat {
  year: number;
  teamName: string;
  league: YouthLeague[];
  minutesPlayedPercent: number;
  mainRole: "Key_Starter" | "Rotation" | "Bench" | "Injured";
  goals: number;
  assists: number;
  honors: string;
}

export interface AcademicProfile {
  graduationYear: number;
  gpa: number;
  testScore?: string;
}

export interface ExposureEvent {
  name: string;
  type: "Showcase" | "ID_Camp" | "ODP" | "HS_Playoffs" | "Other";
  collegesNoted: string;
}

export interface AthleticProfile {
  speed: string;
  strength: string;
  endurance: string;
  workRate: string;
  technical: string;
  tactical: string;
}

export interface PlayerProfile {
  firstName: string;
  lastName: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
  citizenship: string;
  experienceLevel: ExperienceLevel;
  position: Position;
  secondaryPositions: Position[];
  dominantFoot: "Right" | "Left" | "Both";
  height: string;
  gradYear: number;
  state: string;
  seasons: SeasonStat[];
  academics: AcademicProfile;
  athleticProfile: AthleticProfile;
  events: ExposureEvent[];
  videoLink: boolean;
  coachesContacted: number;
  responsesReceived: number;
  offersReceived: number;
}

export interface VisibilityScore {
  level: CollegeLevel;
  visibilityPercent: number;
  notes: string;
}

export interface ReadinessScore {
  athletic: number;
  technical: number;
  tactical: number;
  academic: number;
  market: number;
}

export interface RiskFlag {
  category: "League" | "Minutes" | "Academics" | "Events" | "Location" | "Media" | "Communication";
  message: string;
  severity: "Low" | "Medium" | "High";
}

export interface ActionItem {
  timeframe: "Next_30_Days" | "Next_90_Days" | "Next_12_Months";
  description: string;
  impact: "High" | "Medium" | "Low";
}

export interface FunnelAnalysis {
  stage: "Invisible" | "Outreach" | "Conversation" | "Evaluation" | "Closing";
  conversionRate: string;
  bottleneck: string;
  advice: string;
}

export interface BenchmarkMetric {
  category: string;
  userScore: number;
  d1Average: number;
  d3Average: number;
  feedback: string;
}

export interface AnalysisResult {
  visibilityScores: VisibilityScore[];
  readinessScore: ReadinessScore;
  keyStrengths: string[];
  keyRisks: RiskFlag[];
  actionPlan: ActionItem[];
  plainLanguageSummary: string;
  coachShortEvaluation: string;
  funnelAnalysis: FunnelAnalysis;
  benchmarkAnalysis: BenchmarkMetric[];
}

export const LEAGUES: YouthLeague[] = [
  "MLS_NEXT",
  "ECNL",
  "Girls_Academy",
  "USL_Academy",
  "ECNL_RL",
  "USYS_National_League",
  "High_School",
  "Elite_Local",
  "Other"
];

export const POSITIONS: Position[] = [
  "GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"
];

export const LEVELS: CollegeLevel[] = [
  "D1", "D2", "D3", "NAIA", "JUCO"
];

export const ATHLETIC_RATINGS = [
  "Below_Average",
  "Average",
  "Above_Average",
  "Top_10_Percent",
  "Elite"
];
