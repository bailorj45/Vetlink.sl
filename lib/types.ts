export type UserRole = 'farmer' | 'vet' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Farmer extends User {
  role: 'farmer';
  farmSize: string;
  livestockCategories: string[];
  district: string;
  address: string;
}

export interface Veterinarian extends User {
  role: 'vet';
  licenseNumber: string;
  specialization: string;
  district: string;
  yearsOfExperience: number;
  bio: string;
  verified: boolean;
  availability: 'available' | 'busy' | 'unavailable';
  rating?: number;
  totalAppointments?: number;
}

export interface Livestock {
  id: string;
  farmerId: string;
  name: string;
  species: string;
  breed?: string;
  age: string;
  gender: 'male' | 'female' | 'unknown';
  weight?: string;
  color?: string;
  tagNumber?: string;
  dateOfBirth?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  farmerId: string;
  vetId: string;
  livestockId?: string;
  date: string;
  time: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  farmer?: Farmer;
  vet?: Veterinarian;
  livestock?: Livestock;
}

export interface HealthRecord {
  id: string;
  livestockId: string;
  date: string;
  vetId?: string;
  diagnosis: string;
  treatment?: string;
  medication?: string;
  notes?: string;
  temperature?: string;
  weight?: string;
  createdAt: string;
}

export interface BreedingRecord {
  id: string;
  livestockId: string;
  breedingDate: string;
  expectedDeliveryDate?: string;
  deliveryDate?: string;
  sireId?: string;
  notes?: string;
  createdAt: string;
}

export interface DiseaseAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedSpecies: string[];
  affectedDistricts: string[];
  createdAt: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  description: string;
  category: string;
  audioUrl?: string;
  content: string;
  duration?: number;
  createdAt: string;
}

