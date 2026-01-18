import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { adminDb } from '@/lib/firebaseAdmin'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
        }

        // Fetch admin by email
        const snapshot = await adminDb.collection('admins')
            .where('email', '==', email.toLowerCase())
            .limit(1)
            .get();

        if (snapshot.empty) {
            console.error('Admin Login Failed: User not found in Firestore')
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const adminDoc = snapshot.docs[0];
        const admin = adminDoc.data();

        // Verify password
        const isValidPassword = await bcrypt.compare(password, admin.password_hash)

        if (!isValidPassword) {
            console.error('Admin Login Failed: Password mismatch for user', email)
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        // Update last login
        await adminDoc.ref.update({ last_login: new Date().toISOString() })

        // Generate JWT token
        const token = signToken({
            id: adminDoc.id,
            email: admin.email,
            role: admin.role,
            type: 'admin'
        })

        // Create response with cookie
        const response = NextResponse.json({
            success: true,
            admin: {
                id: adminDoc.id,
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
