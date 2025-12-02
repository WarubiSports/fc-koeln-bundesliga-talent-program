import { z } from 'zod';

const VALID_LEAGUES = [
  'MLS_NEXT', 'ECNL', 'Girls_Academy', 'ECNL_RL', 
  'USYS_National_League', 'USL_Academy', 'High_School', 'Elite_Local', 'Other'
] as const;

const VALID_POSITIONS = [
  'GK', 'CB', 'FB', 'WB', 'DM', 'CM', 'AM', 'WING', '9', 'Utility'
] as const;

const VALID_ROLES = ['Key_Starter', 'Rotation', 'Bench', 'Injured'] as const;

const VALID_EVENT_TYPES = ['Showcase', 'ID_Camp', 'ODP', 'HS_Playoffs', 'Other'] as const;

const seasonSchema = z.object({
  year: z.number().int().min(2015).max(2035),
  teamName: z.string().min(1).max(100),
  league: z.enum(VALID_LEAGUES),
  minutesPlayedPercent: z.number().min(0).max(100),
  mainRole: z.enum(VALID_ROLES),
  goals: z.number().int().min(0).max(200).default(0),
  assists: z.number().int().min(0).max(200).default(0),
  honors: z.string().max(500).default('')
});

const eventSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(VALID_EVENT_TYPES),
  collegesNoted: z.string().max(500).default('')
});

export const evaluationInputSchema = z.object({
  fullName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name contains invalid characters'),
  
  email: z.string()
    .email('Invalid email address')
    .max(255),
  
  gradYear: z.number()
    .int()
    .min(2024, 'Graduation year must be 2024 or later')
    .max(2035, 'Graduation year must be before 2035'),
  
  position: z.enum(VALID_POSITIONS),
  
  height: z.string().max(20).optional(),
  
  stateRegion: z.string()
    .min(2)
    .max(50),
  
  gpa: z.number()
    .min(0, 'GPA must be at least 0')
    .max(5.0, 'GPA must be 5.0 or less'),
  
  testScore: z.string().max(50).optional(),
  
  seasons: z.array(seasonSchema)
    .min(1, 'At least one season is required')
    .max(10, 'Maximum 10 seasons allowed'),
  
  hasVideoLink: z.boolean().default(false),
  
  coachesContacted: z.number()
    .int()
    .min(0)
    .max(500)
    .default(0),
  
  responsesReceived: z.number()
    .int()
    .min(0)
    .max(500)
    .default(0),
  
  events: z.array(eventSchema)
    .max(20, 'Maximum 20 events allowed')
    .default([]),
  
  consentToContact: z.boolean().default(true)
});

export type EvaluationInput = z.infer<typeof evaluationInputSchema>;

/**
 * Validate and parse evaluation input
 * Returns parsed data or throws ZodError
 */
export function validateEvaluationInput(data: unknown): EvaluationInput {
  return evaluationInputSchema.parse(data);
}

/**
 * Safe validation that returns result object
 */
export function safeValidateEvaluationInput(data: unknown): {
  success: boolean;
  data?: EvaluationInput;
  errors?: string[];
} {
  const result = evaluationInputSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map((issue: { path: (string | number)[]; message: string }) => 
    `${issue.path.join('.')}: ${issue.message}`
  );
  
  return { success: false, errors };
}
