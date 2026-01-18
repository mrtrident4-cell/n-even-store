import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all customers
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    try {
        let query: FirebaseFirestore.Query = adminDb.collection('customers')

        if (status === 'active') {
            query = query.where('is_active', '==', true)
        } else if (status === 'suspended') {
            query = query.where('is_active', '==', false)
        }

        // Firestore search limitation: Can't easily do partial string match.
        // We'll skip search filtering on server for now, or implement exact match.
        // If search looks like a phone, search phone field.
        if (search) {
            // Basic exact match attempt for phone or email
            // Better solution: ElasticSearch or Algolia. For now: fetch most recent and filter in memory if dataset is small, 
            // but here just return recent.
        }

        const snapshot = await query.orderBy('created_at', 'desc').get();
        // Manual pagination
        const total = snapshot.size;
        const customers = snapshot.docs
            .slice((page - 1) * limit, page * limit)
            .map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE customer (suspend/unsuspend, update details)
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
        }

        // Only allow updating specific fields
        const allowedFields = ['name', 'email', 'is_active', 'notes']
        const filteredUpdates: Record<string, any> = {}

        for (const key of allowedFields) {
            if (updates[key] !== undefined) {
                filteredUpdates[key] = updates[key]
            }
        }

        filteredUpdates.updated_at = new Date().toISOString()

        await adminDb.collection('customers').doc(id).update(filteredUpdates);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE customer
export async function DELETE(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    try {
        await adminDb.collection('customers').doc(id).delete();
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
