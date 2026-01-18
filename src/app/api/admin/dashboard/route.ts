import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    // Verify admin
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // Orders collection reference
        const ordersRef = adminDb.collection('orders');
        const customersRef = adminDb.collection('customers');
        const productsRef = adminDb.collection('products');

        // Total sales today
        const todaySalesSnap = await ordersRef
            .where('created_at', '>=', startOfDay)
            .where('payment_status', '==', 'paid')
            .get();

        const totalSalesToday = todaySalesSnap.docs.reduce((sum, doc) => sum + (doc.data().total_amount || 0), 0);

        // Total sales this month
        const monthSalesSnap = await ordersRef
            .where('created_at', '>=', startOfMonth)
            .where('payment_status', '==', 'paid')
            .get();

        const totalSalesMonth = monthSalesSnap.docs.reduce((sum, doc) => sum + (doc.data().total_amount || 0), 0);

        // Total orders (count)
        // Using get().size is readable but costs N reads. For production, use aggregation queries or counters.
        const allOrdersSnap = await ordersRef.get(); // Warning: Reads all orders. Optimize later.
        const totalOrders = allOrdersSnap.size;

        // Pending orders
        const pendingOrdersSnap = await ordersRef.where('status', '==', 'pending').get();
        const pendingOrders = pendingOrdersSnap.size;

        // Total customers
        const customersSnap = await customersRef.get(); // Warning: Reads all customers
        const totalCustomers = customersSnap.size;

        // Low stock products - skipping complex subfield query for now
        const lowStockProducts = 0;

        // Recent orders
        const recentOrdersSnap = await ordersRef
            .orderBy('created_at', 'desc')
            .limit(10)
            .get();

        const recentOrders = recentOrdersSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Best sellers - simplified logic or placeholder
        // Aggregating locally from recent 100 orders instead of all order items is safer for reads
        const bestSellers: any[] = []; // Implement later if needed

        return NextResponse.json({
            totalSalesToday,
            totalSalesMonth,
            totalOrders,
            pendingOrders,
            totalCustomers,
            lowStockProducts,
            recentOrders,
            bestSellers
        })
    } catch (err: any) {
        console.error('Dashboard error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
