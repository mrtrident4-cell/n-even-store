import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    // Verify admin
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Total sales today
    const { data: todaySales } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfDay)
        .eq('payment_status', 'paid')

    const totalSalesToday = todaySales?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    // Total sales this month
    const { data: monthSales } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', startOfMonth)
        .eq('payment_status', 'paid')

    const totalSalesMonth = monthSales?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    // Total orders
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })

    // Pending orders
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    // Total customers
    const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

    // Low stock products (variants with stock < 10)
    const { count: lowStockProducts } = await supabase
        .from('product_variants')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 10)
        .eq('is_active', true)

    // Recent orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, payment_status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

    // Best selling products
    const { data: topProducts } = await supabase
        .from('order_items')
        .select('product_name, quantity')
        .limit(100)

    // Aggregate best sellers
    const productSales: Record<string, number> = {}
    topProducts?.forEach(item => {
        productSales[item.product_name] = (productSales[item.product_name] || 0) + item.quantity
    })

    const bestSellers = Object.entries(productSales)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, sold]) => ({ name, sold }))

    return NextResponse.json({
        totalSalesToday,
        totalSalesMonth,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        lowStockProducts: lowStockProducts || 0,
        recentOrders: recentOrders || [],
        bestSellers
    })
}
