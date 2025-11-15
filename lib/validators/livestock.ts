import { z } from 'zod';

export const livestockSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  age: z.string().min(1, 'Age is required'),
  gender: z.enum(['male', 'female', 'unknown']),
  weight: z.string().optional(),
  color: z.string().optional(),
  tagNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  purchaseDate: z.string().optional(),
  notes: z.string().optional(),
});

export const breedingRecordSchema = z.object({
  livestockId: z.string().min(1, 'Livestock is required'),
  breedingDate: z.string().min(1, 'Breeding date is required'),
  expectedDeliveryDate: z.string().optional(),
  sireId: z.string().optional(),
  notes: z.string().optional(),
});

export const healthRecordSchema = z.object({
  livestockId: z.string().min(1, 'Livestock is required'),
  date: z.string().min(1, 'Date is required'),
  vetId: z.string().optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().optional(),
  medication: z.string().optional(),
  notes: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
});

export type LivestockInput = z.infer<typeof livestockSchema>;
export type BreedingRecordInput = z.infer<typeof breedingRecordSchema>;
export type HealthRecordInput = z.infer<typeof healthRecordSchema>;

