-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admins table if not exists
CREATE TABLE IF NOT EXISTS admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    permissions JSONB DEFAULT '["all"]',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS to ensure the API (using anon key) can read the credentials for login check
-- In production, you should use the Service Role Key in your API route instead of disabling RLS
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Insert OR Update the admin user
INSERT INTO admins (email, password_hash, name, role, permissions)
VALUES (
    'admin@neven.com',
    crypt('admin123', gen_salt('bf')),
    'System Admin',
    'super_admin',
    '["all"]'
)
ON CONFLICT (email) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name;
