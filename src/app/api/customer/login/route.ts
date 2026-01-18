import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { otpStore } from '@/lib/otpStore'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export async function POST(request: NextRequest) {
    const { phone, otp } = await request.json()

    if (!phone || !otp) {
        return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 })
    }

    // Verify OTP
    const isValidOtp = otpStore.verifyWithTestOtp(phone, otp)

    if (!isValidOtp) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Clear used OTP
    otpStore.delete(phone)

    // Find customer
    // Check if phone exists in Firestore
    const snapshot = await adminDb.collection('customers')
        .where('phone', '==', phone)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return NextResponse.json({ error: 'Account not found. Please sign up first.' }, { status: 404 })
    }

    const doc = snapshot.docs[0];
    const customer = { id: doc.id, ...doc.data() } as any;

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
