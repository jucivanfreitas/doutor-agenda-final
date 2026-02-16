-- Migration: Enable Row Level Security (RLS) for multi-tenant isolation
-- Creates helper function to set current clinic id in session and enables RLS
-- Applies policies and forces RLS on tables that include `clinic_id`

-- Step 1: Function to set current clinic in session
CREATE OR REPLACE FUNCTION set_current_clinic(p_clinic_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_clinic_id', p_clinic_id::text, false);
END;
$$ LANGUAGE plpgsql;

-- Step 2: Enable RLS on tables that are multi-tenant
ALTER TABLE IF EXISTS appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users_to_clinics ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies per-table to restrict rows to current clinic
CREATE POLICY IF NOT EXISTS clinic_isolation_policy_appointments
  ON appointments
  USING (clinic_id::text = current_setting('app.current_clinic_id', true));

CREATE POLICY IF NOT EXISTS clinic_isolation_policy_patients
  ON patients
  USING (clinic_id::text = current_setting('app.current_clinic_id', true));

CREATE POLICY IF NOT EXISTS clinic_isolation_policy_doctors
  ON doctors
  USING (clinic_id::text = current_setting('app.current_clinic_id', true));

CREATE POLICY IF NOT EXISTS clinic_isolation_policy_users_to_clinics
  ON users_to_clinics
  USING (clinic_id::text = current_setting('app.current_clinic_id', true));

-- Step 4: Force RLS so that table owners cannot bypass policies
ALTER TABLE IF EXISTS appointments FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS patients FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS doctors FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users_to_clinics FORCE ROW LEVEL SECURITY;

-- Note: If there are other tables with `clinic_id`, add them above.
-- Best practice: run these steps in a transaction in production with careful review.
