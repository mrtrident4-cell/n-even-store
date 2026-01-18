import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabaseClient'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Fetch admin by email
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email.toLowerCase())
            .single()

        if (error || !admin) {
            console.error('Admin Login Failed: User not found or DB error.', error)
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash)

        if (!isValidPassword) {
            console.error('Admin Login Failed: Password mismatch for user', email)
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Update last login
        await supabase
            .from('admins')
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id)

        // Generate JWT token
        const token = signToken({
            id: admin.id,
            email: admin.email,
            role: admin.role,
            type: 'admin'
        })

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                permissions: admin.permissions
            }
        })

        // Set HTTP-only cookie
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/'
        })

        return response
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
