import { z } from 'zod';

export const farmerRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  farmSize: z.string().min(1, 'Farm size is required'),
  livestockCategories: z.array(z.string()).min(1, 'Select at least one livestock category'),
  district: z.string().min(1, 'District is required'),
  address: z.string().min(5, 'Address is required'),
});

export const vetRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Invalid phone number'),
  licenseNumber: z.string().min(1, 'License number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  district: z.string().min(1, 'District is required'),
  yearsOfExperience: z.string().min(1, 'Years of experience is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type FarmerRegistrationInput = z.infer<typeof farmerRegistrationSchema>;
export type VetRegistrationInput = z.infer<typeof vetRegistrationSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

