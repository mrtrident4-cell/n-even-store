import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { otpStore } from '@/lib/otpStore'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export async function POST(request: NextRequest) {
    const { phone, name, otp } = await request.json()

    if (!phone || !name) {
        return NextResponse.json({ error: 'Phone and name are required' }, { status: 400 })
    }

    if (!otp) {
        return NextResponse.json({ error: 'OTP is required' }, { status: 400 })
    }

    // Verify OTP
    const isValidOtp = otpStore.verifyWithTestOtp(phone, otp)

    if (!isValidOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Clear used OTP
    otpStore.delete(phone)

    // Check if customer already exists
    const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .single()

    if (existing) {
        return NextResponse.json({ error: 'Account already exists. Please login.' }, { status: 409 })
    }

    // Create new customer
    const { data: customer, error } = await supabase
        .from('customers')
        .insert({
            phone,
            name,
            is_active: true
        })
        .select()
        .single()

    if (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: customer.id, phone: customer.phone, type: 'customer' },
        JWT_SECRET,
        { expiresIn: '30d' }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
    })

    return NextResponse.json({
        success: true,
        customer: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email
        }
    })
}
