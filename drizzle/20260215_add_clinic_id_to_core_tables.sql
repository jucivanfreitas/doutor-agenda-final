-- Migration: add clinic_id columns to core tables (nullable)
ALTER TABLE IF EXISTS doctors
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES clinics(id);

ALTER TABLE IF EXISTS patients
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES clinics(id);

ALTER TABLE IF EXISTS appointments
  ADD COLUMN IF NOT EXISTS clinic_id uuid REFERENCES clinics(id);

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_id ON appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_patients_clinic_id ON patients(clinic_id);
