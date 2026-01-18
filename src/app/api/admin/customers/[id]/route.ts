import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
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

    // Get customer
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

    if (customerError) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Get addresses
    const { data: addresses } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', id)

    // Get order history
    const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total_amount, status, payment_status, created_at')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })
        .limit(20)

    // Calculate stats
    const totalSpent = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    const totalOrders = orders?.length || 0

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

    const { is_blocked } = await request.json()

    const { error } = await supabase
        .from('customers')
        .update({ is_blocked })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
