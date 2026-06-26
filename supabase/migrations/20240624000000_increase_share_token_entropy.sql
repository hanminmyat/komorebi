-- Increase share token entropy from 16 to 32 hex characters (128 bits)
-- Update the column default for future tokens
ALTER TABLE capsules ALTER COLUMN share_token SET DEFAULT substr(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 1, 32);

-- Regenerate tokens for all existing capsules with higher entropy
UPDATE capsules SET share_token = substr(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 1, 32);
