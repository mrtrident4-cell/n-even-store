import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all coupons
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const snapshot = await adminDb.collection('coupons')
            .orderBy('created_at', 'desc')
            .get();

        const coupons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        return NextResponse.json({ coupons })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// CREATE coupon
export async function POST(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at } = await request.json()

        if (!code || !discount_type || !discount_value) {
            return NextResponse.json({ error: 'Code, discount type, and value are required' }, { status: 400 })
        }

        const upperCode = code.toUpperCase();

        // Check if code exists
        const snapshot = await adminDb.collection('coupons')
            .where('code', '==', upperCode)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
        }

        const couponData = {
            code: upperCode,
            description: description || null,
            discount_type,
            discount_value: parseFloat(discount_value),
            min_order_amount: min_order_amount ? parseFloat(min_order_amount) : 0,
            max_discount_amount: max_discount_amount ? parseFloat(max_discount_amount) : null,
            usage_limit: usage_limit ? parseInt(usage_limit) : null,
            expires_at: expires_at || null,
            is_active: true,
            created_at: new Date().toISOString()
        };

        const docRef = await adminDb.collection('coupons').add(couponData);

        return NextResponse.json({ success: true, coupon: { id: docRef.id, ...couponData } })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE coupon
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, is_active, expires_at } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 })
        }

        const updateData: any = {
            code: code?.toUpperCase(),
            description,
            discount_type,
            discount_value: discount_value ? parseFloat(discount_value) : undefined,
            min_order_amount: min_order_amount !== undefined ? parseFloat(min_order_amount) : undefined,
            max_discount_amount: max_discount_amount !== undefined ? (max_discount_amount ? parseFloat(max_discount_amount) : null) : undefined,
            usage_limit: usage_limit !== undefined ? (usage_limit ? parseInt(usage_limit) : null) : undefined,
            is_active,
            expires_at
        };

        // Clean undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await adminDb.collection('coupons').doc(id).update(updateData);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
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

    try {
        await adminDb.collection('coupons').doc(id).delete();
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
