import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { adminAuth } from '@/lib/firebaseAdmin'

// This route checks if a Firebase-authenticated user exists in our database
export async function POST(request: NextRequest) {
    try {
        // Get the Firebase ID token from the Authorization header
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]

        // Verify the Firebase token
        let decodedToken
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken)
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { phone, firebaseUid } = await request.json()

        // Check if customer exists in our database
        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .eq('firebase_uid', firebaseUid)
            .single()

        if (error || !customer) {
            // User doesn't exist, they need to complete signup
            return NextResponse.json({ isNewUser: true })
        }

        // User exists, return their data
        return NextResponse.json({
            success: true,
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                firebaseUid: customer.firebase_uid
            }
        })
    } catch (error: any) {
        console.error('Firebase auth error:', error)
        return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
    }
}
