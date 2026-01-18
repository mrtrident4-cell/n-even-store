import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)

    if (!token) {
        console.log('No token found in request cookies')
        return NextResponse.json({ authenticated: false, message: 'No session token' }, { status: 401 })
    }

    const payload = verifyToken(token)

    if (!payload || payload.type !== 'admin') {
        console.log('Token invalid or wrong role:', payload)
        return NextResponse.json({ authenticated: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    // Fetch fresh admin data
    // In Firestore, get doc by ID (which is in payload.id)
    const docRef = adminDb.collection('admins').doc(payload.id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
        console.error('Database lookup failed for admin ID:', payload.id)
        return NextResponse.json({ authenticated: false, message: 'User record not found' }, { status: 401 })
    }

    const adminData = docSnap.data()!;
    // Return only safe fields
    const admin = {
        id: docSnap.id,
        email: adminData.email,
        name: adminData.name,
        role: adminData.role,
        permissions: adminData.permissions
    };

    console.log('Admin identified successfully:', admin.email)

    return NextResponse.json({
        authenticated: true,
        admin
    })
}
