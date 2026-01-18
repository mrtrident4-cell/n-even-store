import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
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

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      customer:customers(id, email, first_name, last_name, phone),
      items:order_items(id, product_id, variant_id, product_name, product_image, size, color, quantity, unit_price, total_price)
    `)
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
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

    const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
