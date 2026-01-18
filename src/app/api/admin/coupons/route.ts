import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all coupons
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ coupons })
}

// CREATE coupon
export async function POST(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at } = await request.json()

    if (!code || !discount_type || !discount_value) {
        return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 })
    }

    const { data: coupon, error } = await supabase
        .from('coupons')
        .insert({
            code: code.toUpperCase(),
            description,
            discount_type,
            discount_value: parseFloat(discount_value),
            min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
            max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
            usage_limit: usage_limit ? parseInt(usage_limit) : null,
            expires_at: expires_at || null
        })
        .select()
        .single()

    if (error) {
        if (error.code === '23505') {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, coupon })
}

// UPDATE coupon
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, expires_at } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('coupons')
        .update({
            code: code?.toUpperCase(),
            description,
            discount_type,
            discount_value: discount_value ? parseFloat(discount_value) : undefined,
            min_order_amount: min_order_amount !== undefined ? parseFloat(min_order_amount) : undefined,
            max_discount_amount: max_discount_amount !== undefined ? (max_discount_amount ? parseFloat(max_discount_amount) : null) : undefined,
            usage_limit: usage_limit !== undefined ? (usage_limit ? parseInt(usage_limit) : null) : undefined,
            is_active,
            expires_at
        })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

// DELETE coupon
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
        return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
