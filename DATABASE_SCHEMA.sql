-- VetLink Sierra Leone - Realtime Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE cases;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Cases table (for disease reporting and diagnosis)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  livestock_id UUID REFERENCES livestock(id) ON DELETE SET NULL,
  symptom_description TEXT NOT NULL,
  image_url TEXT,
  diagnosis TEXT,
  confidence_score DECIMAL(3,2),
  emergency_flag BOOLEAN DEFAULT FALSE,
  vet_required BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'diagnosed', 'assigned', 'resolved')),
  assigned_vet_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ai_reasoning TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table (for farmer-vet communication)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('farmer', 'vet')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
  audio_url TEXT,
  image_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table (already exists, but adding case_id reference)
-- If table doesn't exist, create it:
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  vet_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT NOT NULL,
  urgency TEXT CHECK (urgency IN ('low', 'medium', 'high', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('message', 'case', 'appointment', 'diagnosis', 'emergency')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_farmer_id ON cases(farmer_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_vet_id ON cases(assigned_vet_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_messages_case_id ON messages(case_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_appointments_farmer_id ON appointments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Create storage bucket for case images
INSERT INTO storage.buckets (id, name, public)
VALUES ('case-images', 'case-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy for case images
CREATE POLICY "Case images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-images');

CREATE POLICY "Users can upload case images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'case-images');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_cases_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Cases policies
CREATE POLICY "Farmers can view their own cases"
ON cases FOR SELECT
USING (auth.uid() = farmer_id);

CREATE POLICY "Vets can view assigned cases"
ON cases FOR SELECT
USING (auth.uid() = assigned_vet_id);

CREATE POLICY "Farmers can create cases"
ON cases FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Vets can update assigned cases"
ON cases FOR UPDATE
USING (auth.uid() = assigned_vet_id);

-- Messages policies
CREATE POLICY "Users can view messages in their cases"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = messages.case_id
    AND (cases.farmer_id = auth.uid() OR cases.assigned_vet_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their cases"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = messages.case_id
    AND (cases.farmer_id = auth.uid() OR cases.assigned_vet_id = auth.uid())
  )
);

-- Appointments policies
CREATE POLICY "Users can view their appointments"
ON appointments FOR SELECT
USING (auth.uid() = farmer_id OR auth.uid() = vet_id);

CREATE POLICY "Farmers can create appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Vets can update their appointments"
ON appointments FOR UPDATE
USING (auth.uid() = vet_id);

-- Notifications policies
CREATE POLICY "Users can view their notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

