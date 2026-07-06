import * as z from 'zod';

export const leaveSchema = z.object({
  leave_type_id: z.string().min(1, "Please select a leave type"),
  dates: z.any().refine(val => {
    if (Array.isArray(val)) return val.length > 0;
    return val != null && val !== '';
  }, "Please select at least one date"),
  reason: z.string().min(5, "Reason must be at least 5 characters long"),
  emergency_contact: z.string().optional(),
  is_half_day: z.boolean().optional(),
  is_compensatory: z.boolean().optional(),
  session: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.is_half_day && !data.session) {
    ctx.addIssue({
      path: ['session'],
      message: 'Please select a session for your half day',
      code: z.ZodIssueCode.custom
    });
  }
  if (data.is_half_day && data.dates && data.dates.length > 1) {
    ctx.addIssue({
      path: ['is_half_day'],
      message: 'Half day is only applicable for single-day requests',
      code: z.ZodIssueCode.custom
    });
  }
});
