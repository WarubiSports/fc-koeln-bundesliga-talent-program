import { Router, Request, Response } from "express";
import { z } from "zod";
import { analyzePlayerExposure } from "../services/exposureAnalysis.js";
import type { PlayerProfile } from "../../shared/exposure-types";
import { logger } from "../utils/logger.js";

const router = Router();

const LeagueEnum = z.enum([
  'MLS_NEXT', 'ECNL', 'ECNL_RL', 'Girls_Academy', 'USL_Academy',
  'USYS_National_League', 'USYS_Elite_64', 'NPL', 'State_Premier',
  'High_School', 'Local_Travel', 'House_League', 'Other'
]);

const AthleticRatingEnum = z.enum([
  'Below_Average', 'Average', 'Above_Average', 'Top_10_Percent', 'Elite'
]);

const PlayerProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(['Male', 'Female']),
  position: z.string().min(1),
  gradYear: z.number().min(2024).max(2035),
  seasons: z.array(z.object({
    year: z.number(),
    teamName: z.string(),
    league: z.array(LeagueEnum),
    minutesPlayedPercent: z.number().min(0).max(100),
    mainRole: z.enum(['Key_Starter', 'Rotation', 'Bench', 'Injured']),
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
    honors: z.string().optional()
  })).min(1, "At least one season is required"),
  academics: z.object({
    graduationYear: z.number().optional(),
    gpa: z.number().min(0).max(4),
    testScore: z.string().optional()
  }).optional(),
  athleticProfile: z.object({
    speed: AthleticRatingEnum.optional(),
    strength: AthleticRatingEnum.optional(),
    endurance: AthleticRatingEnum.optional(),
    workRate: AthleticRatingEnum.optional(),
    technical: AthleticRatingEnum.optional(),
    tactical: AthleticRatingEnum.optional()
  }).optional(),
  videoLink: z.boolean().default(false),
  coachesContacted: z.number().min(0).default(0),
  responsesReceived: z.number().min(0).default(0),
  offersReceived: z.number().min(0).default(0)
}).passthrough();

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

router.post("/analyze", async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!checkRateLimit(clientIp)) {
    logger.warn('Rate limit exceeded for exposure analysis', { ip: clientIp });
    return res.status(429).json({
      success: false,
      error: "Too many requests. Please wait 1 minute before trying again.",
    });
  }

  try {
    const validationResult = PlayerProfileSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      logger.warn('Invalid exposure analysis request', { errors, ip: clientIp });
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${errors}`,
      });
    }

    const profile = validationResult.data as PlayerProfile;

    logger.info('Processing exposure analysis', { 
      name: `${profile.firstName} ${profile.lastName}`,
      gradYear: profile.gradYear,
      ip: clientIp
    });

    const result = await analyzePlayerExposure(profile);

    logger.info('Exposure analysis completed', { 
      name: `${profile.firstName} ${profile.lastName}`,
      ip: clientIp
    });

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error("Exposure analysis failed", { error, ip: clientIp });
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Analysis failed. Please try again.",
    });
  }
});

export default router;
