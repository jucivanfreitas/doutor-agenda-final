-- Migration: create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id text NOT NULL,
  subscription_status text NOT NULL DEFAULT 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinics_owner_id ON clinics(owner_id);
