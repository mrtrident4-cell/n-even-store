import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminDb } from '@/lib/firebaseAdmin'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'

export async function GET(request: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('customer_token')?.value

    if (!token) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string; phone: string; type: string }

        if (payload.type !== 'customer') {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
        }

        const docRef = adminDb.collection('customers').doc(payload.id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        const customer = { id: docSnap.id, ...docSnap.data() };

        return NextResponse.json({ customer })
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
}
