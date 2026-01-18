-- =====================================================
-- FIX ADMIN LOGIN ACCESS
-- Run this script in the Supabase SQL Editor
-- =====================================================

-- We enabled RLS but forgot to add policies, so the API cannot read the admin user.
-- For now, we will disable RLS on the admins table to allow login.
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- If you prefer to keep RLS enabled, run this instead (uncomment):
-- CREATE POLICY "Allow public read access to admins" ON admins FOR SELECT USING (true);
