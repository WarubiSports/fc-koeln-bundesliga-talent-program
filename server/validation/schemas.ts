import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const requestResetSchema = z.object({
  email: z.string().email('Invalid email format')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters')
});

export const updateInjurySchema = z.object({
  healthStatus: z.enum(['healthy', 'injured']),
  injuryType: z.string().optional(),
  injuryDate: z.string().optional(),
  injuryEndDate: z.string().optional()
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  eventType: z.string().min(1, 'Event type is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
  notes: z.string().optional(),
  participants: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringPattern: z.string().optional(),
  recurringEndDate: z.string().optional(),
  recurringDays: z.string().optional()
});

export const updateEventSchema = createEventSchema.partial();

export const attendanceSchema = z.object({
  status: z.enum(['pending', 'attending', 'not_attending', 'attended', 'absent']),
  userId: z.string().optional()
});

export const createGroceryOrderSchema = z.object({
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  items: z.array(z.object({
    itemId: z.number().int().positive(),
    quantity: z.number().int().positive().max(100)
  })).min(1, 'At least one item is required')
});

export const createChoreSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  house: z.string().min(1, 'House is required'),
  assignedTo: z.string().min(1, 'Assigned player is required'),
  dueDate: z.string().optional(),
  weekStartDate: z.string().optional(),
  frequency: z.string().optional(),
  isRecurring: z.boolean().optional()
});

export const verifyChoreSchema = z.object({
  verified: z.boolean()
});

export const createGroceryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  price: z.string().min(1, 'Price is required')
});

export const updateGroceryItemSchema = createGroceryItemSchema.partial();

export const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  preferredFoot: z.string().optional(),
  height: z.number().int().positive().optional(),
  weight: z.number().int().positive().optional()
});

export const idParamSchema = z.object({
  id: z.string().min(1)
});

export const eventsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.string().optional()
}).passthrough();

export const choresQuerySchema = z.object({
  house: z.string().optional(),
  status: z.string().optional(),
  weekStartDate: z.string().optional()
}).passthrough();

export const groceryQuerySchema = z.object({
  category: z.string().optional(),
  deliveryDate: z.string().optional()
}).passthrough();

export type LoginInput = z.infer<typeof loginSchema>;
export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateGroceryOrderInput = z.infer<typeof createGroceryOrderSchema>;
export type CreateGroceryItemInput = z.infer<typeof createGroceryItemSchema>;

interface ValidatedRequest extends Request {
  validatedQuery?: Record<string, unknown>;
}

export function validate<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors
      });
    }
    (req as ValidatedRequest).validatedQuery = result.data as Record<string, unknown>;
    next();
  };
}

export function validateParams<T extends z.ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Invalid URL parameters',
        errors
      });
    }
    next();
  };
}
