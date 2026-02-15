-- Backfill clinic_id in core tables using existing relations
-- 1) Try to populate doctors and patients from users_to_clinics when possible
-- 2) Populate appointments from doctors and patients

-- Populate doctors.clinic_id where possible via users_to_clinics (if a doctor record has a matching user id)
UPDATE doctors
SET clinic_id = utc.clinic_id
FROM (
  SELECT u2c.clinic_id, u.id as user_id
  FROM users u
  JOIN users_to_clinics u2c ON u.id = u2c.user_id
) AS utc
WHERE doctors.name IS NOT NULL AND FALSE; -- no reliable user link for doctors; skip by default

-- Populate patients.clinic_id similarly (skip if no reliable mapping)
UPDATE patients
SET clinic_id = utc.clinic_id
FROM (
  SELECT u2c.clinic_id, u.id as user_id
  FROM users u
  JOIN users_to_clinics u2c ON u.id = u2c.user_id
) AS utc
WHERE patients.email IS NOT NULL AND FALSE; -- no reliable user link for patients; skip by default

-- Populate appointments from doctors.clinic_id when available
UPDATE appointments
SET clinic_id = d.clinic_id
FROM doctors d
WHERE appointments.doctor_id = d.id AND appointments.clinic_id IS NULL AND d.clinic_id IS NOT NULL;

-- Populate appointments from patients.clinic_id when available
UPDATE appointments
SET clinic_id = p.clinic_id
FROM patients p
WHERE appointments.patient_id = p.id AND appointments.clinic_id IS NULL AND p.clinic_id IS NOT NULL;

-- Note: Some records may remain with NULL clinic_id and will need manual resolution.
-- Do NOT set NOT NULL constraint until all rows are filled and verified.
