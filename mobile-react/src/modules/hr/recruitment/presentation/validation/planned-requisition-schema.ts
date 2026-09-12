import { z } from 'zod';

export const plannedRequisitionSchema = z.object({
  staffingRequestId: z.coerce.number().int().positive('Select an approved staffing request.'),
  requestedPositions: z.coerce.number().int().positive('Enter at least one position.'),
  businessReason: z.string().trim().min(3, 'Enter a clear business reason.').max(2000),
  employmentType: z.coerce.number().int().positive(),
  workArrangement: z.coerce.number().int().positive(),
  targetHireDate: z.string().optional(),
  type: z.coerce.number().int().positive(),
  replacementEmployeeId: z.coerce.number().int().positive().optional(),
});

export type PlannedRequisitionValues = z.infer<typeof plannedRequisitionSchema>;
