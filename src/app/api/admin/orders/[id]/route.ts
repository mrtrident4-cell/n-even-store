import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single order
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const orderDoc = await adminDb.collection('orders').doc(id).get();

        if (!orderDoc.exists) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        const orderData = orderDoc.data()!;
        let order = { id: orderDoc.id, ...orderData };

        // Fetch customer info if available
        if (orderData.customer_id) {
            const customerDoc = await adminDb.collection('customers').doc(orderData.customer_id).get();
            if (customerDoc.exists) {
                const cData = customerDoc.data()!;
                order = {
                    ...order,
                    customer: {
                        id: customerDoc.id,
                        email: cData.email,
                        name: cData.name,
                        phone: cData.phone,
                        ...cData
                    }
                };
            }
        }

        // Fetch Items if not embedded (check subcollection 'items')
        if (!orderData.items || (Array.isArray(orderData.items) && orderData.items.length === 0)) {
            const itemsSnap = await orderDoc.ref.collection('order_items').get(); // Try subcollection
            if (!itemsSnap.empty) {
                order = {
                    ...order,
                    items: itemsSnap.docs.map(i => ({ id: i.id, ...i.data() }))
                };
            }
        }

        return NextResponse.json({ order })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE order status
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { status, payment_status, admin_notes } = await request.json()

        const updates: Record<string, unknown> = {}

        if (status) {
            updates.status = status
            if (status === 'shipped') {
                updates.shipped_at = new Date().toISOString()
            }
            if (status === 'delivered') {
                updates.delivered_at = new Date().toISOString()
            }
        }

        if (payment_status) {
            updates.payment_status = payment_status
        }

        if (admin_notes !== undefined) {
            updates.admin_notes = admin_notes
        }

        await adminDb.collection('orders').doc(id).update(updates);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
