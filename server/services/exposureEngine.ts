import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are a veteran US College Soccer Recruiting Director. You are brutally honest, data-driven, and realistic. Your goal is to prevent youth players from having false hope and to give them a concrete roadmap.

Analyze the provided Player Profile JSON and output a JSON response.

**Recruiting Logic Rules:**
1. **League & Minutes:** MLS NEXT/ECNL starters have high D1 visibility. Bench players or lower leagues (ECNL RL, USYS) have significantly lower D1 visibility unless they have exceptional attributes or massive event exposure.
2. **High School:** Playing only High School soccer is rarely enough for D1 exposure today, regardless of stats, unless it's a top metro area (St. Louis, NJ, SoCal) combined with club play.
3. **Academics:** GPA < 3.0 kills D3 options and limits D1 considerably. GPA > 3.5 opens the Ivy/Patriot/D3 academic market.
4. **Engagement:** Sending 0 emails results in 0 visibility. A high email count with low response rate indicates a targeting mismatch (aiming too high) or bad subject lines/video.
5. **Video:** If no highlight video, visibility scores across all levels drop by 40%. Coaches cannot recruit what they cannot see.

**Output Style:**
- **Summary:** Direct and strictly factual. Use phrases like "Your current trajectory suggests..." or "You are invisible to D1 coaches because..."
- **Action Plan:** Must be specific. Do not say "Work hard." Say "Attend 2 ID camps in the Northeast" or "Film a new highlight video focused on defensive transition."
- **Scores:** Be conservative. 80%+ visibility is rare.

**Response Format:**
Return ONLY valid JSON with this exact structure:
{
  "visibilityScores": [
    {"level": "D1", "visibilityPercent": 0-100, "notes": "..."},
    {"level": "D2", "visibilityPercent": 0-100, "notes": "..."},
    {"level": "D3", "visibilityPercent": 0-100, "notes": "..."},
    {"level": "NAIA", "visibilityPercent": 0-100, "notes": "..."},
    {"level": "JUCO", "visibilityPercent": 0-100, "notes": "..."}
  ],
  "readinessScore": {
    "athletic": 0-100,
    "technical": 0-100,
    "tactical": 0-100,
    "academic": 0-100,
    "market": 0-100
  },
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "keyRisks": [
    {"category": "League|Minutes|Academics|Events|Location|Media|Communication", "message": "...", "severity": "Low|Medium|High"}
  ],
  "actionPlan": [
    {"timeframe": "Next_30_Days|Next_90_Days|Next_12_Months", "description": "...", "impact": "High|Medium|Low"}
  ],
  "plainLanguageSummary": "2-3 sentences of brutally honest assessment"
}
`;

interface SeasonStat {
  year: number;
  teamName: string;
  league: string;
  minutesPlayedPercent: number;
  mainRole: string;
  goals: number;
  assists: number;
  honors: string;
}

interface ExposureEvent {
  name: string;
  type: string;
  collegesNoted: string;
}

interface PlayerProfile {
  fullName: string;
  email: string;
  gradYear: number;
  position: string;
  height?: string;
  stateRegion: string;
  gpa: number;
  testScore?: string;
  seasons: SeasonStat[];
  hasVideoLink: boolean;
  coachesContacted: number;
  responsesReceived: number;
  events: ExposureEvent[];
}

interface VisibilityScore {
  level: string;
  visibilityPercent: number;
  notes: string;
}

interface ReadinessScore {
  athletic: number;
  technical: number;
  tactical: number;
  academic: number;
  market: number;
}

interface RiskFlag {
  category: string;
  message: string;
  severity: string;
}

interface ActionItem {
  timeframe: string;
  description: string;
  impact: string;
}

export interface AnalysisResult {
  visibilityScores: VisibilityScore[];
  readinessScore: ReadinessScore;
  keyStrengths: string[];
  keyRisks: RiskFlag[];
  actionPlan: ActionItem[];
  plainLanguageSummary: string;
  overallScore: number;
  bucket: string;
  rating: string;
  tags: string[];
}

export async function analyzePlayerExposure(profile: PlayerProfile): Promise<AnalysisResult> {
  const apiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: baseUrl ? { baseUrl } : undefined
  });

  const userPrompt = `
${SYSTEM_PROMPT}

**Player Profile Data:**
${JSON.stringify(profile, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    console.log("ExposureEngine AI response received successfully");

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");
    
    const result = JSON.parse(jsonMatch[0]);
    
    const avgVisibility = result.visibilityScores.reduce((sum: number, s: VisibilityScore) => sum + s.visibilityPercent, 0) / 5;
    const overallScore = Math.round(avgVisibility);
    
    let bucket: string;
    let rating: string;
    if (overallScore >= 70) {
      bucket = 'A';
      rating = 'Elite Prospect';
    } else if (overallScore >= 50) {
      bucket = 'B';
      rating = 'Strong Candidate';
    } else if (overallScore >= 30) {
      bucket = 'C';
      rating = 'Development Track';
    } else {
      bucket = 'D';
      rating = 'Limited Visibility';
    }
    
    const tags: string[] = [];
    const topLeague = profile.seasons[0]?.league;
    if (topLeague && ['MLS_NEXT', 'ECNL', 'Girls_Academy'].includes(topLeague.replace(' ', '_'))) {
      tags.push('Top-Tier League');
    }
    if (profile.hasVideoLink) {
      tags.push('Video Available');
    }
    if (profile.gpa >= 3.5) {
      tags.push('Academic Fit');
    }
    if (profile.coachesContacted > 20) {
      tags.push('Active Recruiter');
    }
    if (profile.events.length >= 3) {
      tags.push('Event Exposure');
    }
    tags.push(profile.position);
    
    return {
      ...result,
      overallScore,
      bucket,
      rating,
      tags
    };
  } catch (error) {
    console.error("ExposureEngine Analysis Failed:", error);
    throw error;
  }
}
