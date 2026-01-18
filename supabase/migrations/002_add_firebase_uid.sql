-- Add firebase_uid column to customers table for Firebase Authentication
ALTER TABLE customers ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(128) UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_firebase_uid ON customers(firebase_uid);
