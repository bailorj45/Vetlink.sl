import { z } from 'zod';

export const appointmentSchema = z.object({
  vetId: z.string().min(1, 'Veterinarian is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  livestockId: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

