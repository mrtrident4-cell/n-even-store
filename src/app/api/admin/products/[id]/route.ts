import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET single product
export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const docRef = adminDb.collection('products').doc(id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        const product = { id: docSnap.id, ...docSnap.data() };

        return NextResponse.json({ product })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE product
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, description, price, compare_price, category_id, gender, is_active, is_featured, images, variants, collections } = body

        const updateData: any = {
            name,
            description,
            price: parseFloat(price),
            compare_price: compare_price ? parseFloat(compare_price) : null,
            category_id: category_id || null,
            gender: gender || null,
            is_active,
            is_featured,
            updated_at: new Date().toISOString()
        }

        // Update images if provided (replace entire array)
        if (images) {
            updateData.images = images.length > 0 ? images.map((img: { url: string; alt?: string }, index: number) => ({
                id: `img-${Date.now()}-${index}`,
                image_url: img.url,
                alt_text: img.alt || name,
                is_primary: index === 0,
                sort_order: index
            })) : [];
        }

        // Update variants if provided (replace entire array)
        if (variants) {
            updateData.variants = variants.length > 0 ? variants.map((v: { size: string; color: string; color_hex?: string; stock: number; sku?: string }, index: number) => ({
                id: `var-${Date.now()}-${index}`,
                size: v.size,
                color: v.color,
                color_hex: v.color_hex || null,
                stock_quantity: v.stock || 0,
                sku: v.sku, // Keep existing SKU if provided, or could generate new
                is_active: true
            })) : [];
        }

        // Update collections if provided
        if (collections) {
            updateData.collections = collections;
        }

        await adminDb.collection('products').doc(id).update(updateData);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Update product error:', err)
        return NextResponse.json({ error: 'Failed to update product: ' + err.message }, { status: 500 })
    }
}

// DELETE product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const { id } = await params

    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await adminDb.collection('products').doc(id).delete();
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
