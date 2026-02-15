-- Migration: create system_settings table and initial seed
CREATE TABLE IF NOT EXISTS system_settings (
  id text PRIMARY KEY,
  app_name text NOT NULL,
  logo_url text,
  primary_color text,
  support_email text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Seed default settings
INSERT INTO system_settings (id, app_name)
VALUES ('system', 'Pleno PSI')
ON CONFLICT (id) DO NOTHING;
