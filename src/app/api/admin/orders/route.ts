import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

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
    const status = searchParams.get('status')
    const customer_id = searchParams.get('customer_id')
    const search = searchParams.get('search')

    try {
        let query: FirebaseFirestore.Query = adminDb.collection('orders')

        if (status && status !== 'all') {
            query = query.where('status', '==', status)
        }

        if (customer_id) {
            query = query.where('customer_id', '==', customer_id)
        }

        // Search by Order ID (exact match)
        if (search) {
            // Check if it's a valid ID or just try to find exact match
            // Firestore doesn't search well. We can just try to get the doc if it looks like an ID,
            // or perform equality check if stored as field. Assuming 'id' is doc ID.
            try {
                const doc = await adminDb.collection('orders').doc(search).get();
                if (doc.exists) {
                    return NextResponse.json({
                        orders: [{ id: doc.id, ...doc.data() }],
                        pagination: { page: 1, limit, total: 1, totalPages: 1 }
                    })
                }
                return NextResponse.json({ orders: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } })
            } catch {
                // Ignore error, return empty
            }
        }

        const snapshot = await query.orderBy('created_at', 'desc').get();
        // Manual pagination for now
        const total = snapshot.size;
        const totalPages = Math.ceil(total / limit);
        const orders = snapshot.docs
            .slice((page - 1) * limit, page * limit)
            .map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        })
    } catch (err: any) {
        console.error('Error fetching orders:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { id, status, tracking_number, notes } = body

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        const updates: any = { updated_at: new Date().toISOString() }
        if (status) updates.status = status
        if (tracking_number !== undefined) updates.tracking_number = tracking_number
        if (notes !== undefined) updates.notes = notes

        await adminDb.collection('orders').doc(id).update(updates);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
