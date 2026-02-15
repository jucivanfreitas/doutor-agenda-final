-- Migration: create users_to_clinics table (association between users and clinics)
CREATE TABLE IF NOT EXISTS users_to_clinics (
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_to_clinics_clinic_user ON users_to_clinics (clinic_id, user_id);
