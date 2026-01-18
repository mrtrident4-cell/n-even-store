-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create admins table if it doesn't exist
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

-- Insert default admin user
-- Email: admin@neven.com
-- Password: admin123
INSERT INTO admins (email, password_hash, name, role, permissions)
VALUES (
    'admin@neven.com',
    crypt('admin123', gen_salt('bf')),
    'System Admin',
    'super_admin',
    '["all"]'
) ON CONFLICT (email) DO NOTHING;
