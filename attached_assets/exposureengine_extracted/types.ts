export type YouthLeague =
  | "MLS_NEXT"
  | "ECNL"
  | "Girls_Academy"
  | "USYS_National_League"
  | "ECNL_RL"
  | "High_School"
  | "Elite_Local"
  | "Other";

export type CollegeLevel = "D1" | "D2" | "D3" | "NAIA" | "JUCO";

export type Position =
  | "GK" | "CB" | "FB" | "WB" | "DM" | "CM" | "AM" | "WING" | "9" | "Utility";

export interface SeasonStat {
  year: number;
  teamName: string;
  league: YouthLeague;
  minutesPlayedPercent: number; // Simplified from raw minutes for better UX
  mainRole: "Key_Starter" | "Rotation" | "Bench" | "Injured";
  goals: number;
  assists: number;
  honors: string; // Comma separated
}

export interface AcademicProfile {
  graduationYear: number;
  gpa: number;
  testScore?: string; // e.g. "1250 SAT"
}

export interface ExposureEvent {
  name: string;
  type: "Showcase" | "ID_Camp" | "ODP" | "HS_Playoffs" | "Other";
  collegesNoted: string; // Comma separated list of colleges seen
}

export interface PlayerProfile {
  fullName: string;
  position: Position;
  height: string;
  gradYear: number;
  state: string;
  seasons: SeasonStat[];
  academics: AcademicProfile;
  events: ExposureEvent[];
  videoLink: boolean;
  coachesContacted: number;
  responsesReceived: number;
}

// AI Analysis Result Types

export interface VisibilityScore {
  level: CollegeLevel;
  visibilityPercent: number; // 0-100
  notes: string;
}

export interface ReadinessScore {
  athletic: number;
  technical: number;
  tactical: number;
  academic: number;
  market: number; // visibility + fit
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

export interface AnalysisResult {
  visibilityScores: VisibilityScore[];
  readinessScore: ReadinessScore;
  keyStrengths: string[];
  keyRisks: RiskFlag[];
  actionPlan: ActionItem[];
  plainLanguageSummary: string;
}