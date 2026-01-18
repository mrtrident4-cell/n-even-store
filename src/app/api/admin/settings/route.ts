import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all settings
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const docSnap = await adminDb.collection('settings').doc('store').get();
        const settingsObj = docSnap.exists ? docSnap.data() : {};
        return NextResponse.json({ settings: settingsObj || {} })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE settings
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Check if admin has settings permission
        const adminDoc = await adminDb.collection('admins').doc(payload.id).get();
        const admin = adminDoc.data();

        if (!admin?.permissions?.settings) {
            return NextResponse.json({ error: 'You do not have permission to modify settings' }, { status: 403 })
        }

        const settings = await request.json()

        // Update settings doc
        await adminDb.collection('settings').doc('store').set(settings, { merge: true });

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
