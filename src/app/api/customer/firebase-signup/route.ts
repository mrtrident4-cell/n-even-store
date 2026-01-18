import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { adminAuth } from '@/lib/firebaseAdmin'

// This route creates a new customer after Firebase phone verification
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

        const { phone, name, firebaseUid } = await request.json()

        if (!phone || !name || !firebaseUid) {
            return NextResponse.json({ error: 'Phone, name, and firebaseUid are required' }, { status: 400 })
        }

        // Check if customer already exists
        const { data: existing } = await supabase
            .from('customers')
            .select('id')
            .eq('firebase_uid', firebaseUid)
            .single()

        if (existing) {
            return NextResponse.json({ error: 'Account already exists' }, { status: 409 })
        }

        // Create new customer
        const { data: customer, error } = await supabase
            .from('customers')
            .insert({
                phone,
                name,
                firebase_uid: firebaseUid,
                is_active: true
            })
            .select()
            .single()

        if (error) {
            console.error('Signup error:', error)
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
        }

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
        console.error('Firebase signup error:', error)
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
    }
}
