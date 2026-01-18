import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single customer with order history
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const customerDoc = await adminDb.collection('customers').doc(id).get();

        if (!customerDoc.exists) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        const customer = { id: customerDoc.id, ...customerDoc.data() };

        // Get addresses (assuming stored in subcollection 'addresses' or just empty for now)
        const addressesSnap = await customerDoc.ref.collection('addresses').get();
        const addresses = addressesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Get order history
        const ordersSnap = await adminDb.collection('orders')
            .where('customer_id', '==', id)
            .orderBy('created_at', 'desc')
            .limit(20)
            .get();

        const orders = ordersSnap.docs.map(doc => ({
            id: doc.id,
            order_number: doc.data().order_number,
            total_amount: doc.data().total_amount,
            status: doc.data().status,
            payment_status: doc.data().payment_status,
            created_at: doc.data().created_at
        }));

        // Calculate stats
        const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        const totalOrders = orders.length;

        return NextResponse.json({
            customer: {
                ...customer,
                addresses,
                orders,
                stats: {
                    totalSpent,
                    totalOrders
                }
            }
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE customer (block/unblock)
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { is_blocked } = await request.json()

        await adminDb.collection('customers').doc(id).update({ is_blocked });

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
