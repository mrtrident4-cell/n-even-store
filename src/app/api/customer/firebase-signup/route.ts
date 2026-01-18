import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

// This route creates a new customer after Firebase phone verification
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
        }

        const idToken = authHeader.split('Bearer ')[1]
        try {
            await adminAuth.verifyIdToken(idToken)
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { phone, name, firebaseUid } = await request.json()

        if (!phone || !name || !firebaseUid) {
            return NextResponse.json({ error: 'Phone, name, and firebaseUid are required' }, { status: 400 })
        }

        // Check if customer already exists
        const snapshot = await adminDb.collection('customers')
            .where('firebase_uid', '==', firebaseUid)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return NextResponse.json({ error: 'Account already exists' }, { status: 409 })
        }

        const customerData = {
            phone,
            name,
            firebase_uid: firebaseUid,
            is_active: true,
            created_at: new Date().toISOString()
        };

        const docRef = await adminDb.collection('customers').add(customerData);

        return NextResponse.json({
            success: true,
            customer: {
                id: docRef.id,
                ...customerData
            }
        })
    } catch (error: any) {
        console.error('Firebase signup error:', error)
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
    }
}
