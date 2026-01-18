import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
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

    let query = supabase
        .from('orders')
        .select(`
            *,
            customer:customers(id, name, email, phone),
            items:order_items(
                *,
                product:products(name, images)
            )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (status && status !== 'all') {
        query = query.eq('status', status)
    }

    if (customer_id) {
        query = query.eq('customer_id', customer_id)
    }

    // Search by Order ID
    if (search) {
        query = query.eq('id', search)
    }

    const { data: orders, error, count } = await query

    if (error) {
        console.error('Error fetching orders:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        orders,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    })
}

export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, tracking_number, notes } = body

    if (!id) {
        return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const updates: any = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (tracking_number !== undefined) updates.tracking_number = tracking_number
    if (notes !== undefined) updates.notes = notes

    const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
