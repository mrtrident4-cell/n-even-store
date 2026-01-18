import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
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

    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, image_url, is_primary, sort_order),
      variants:product_variants(id, size, color, color_hex, stock_quantity, sku, is_active, price_adjustment)
    `)
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
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
        const { name, description, price, compare_price, category_id, gender, is_active, is_featured, images, variants } = body

        // Update product
        const { error: productError } = await supabase
            .from('products')
            .update({
                name,
                description,
                price: parseFloat(price),
                compare_price: compare_price ? parseFloat(compare_price) : null,
                category_id: category_id || null,
                gender: gender || null,
                is_active,
                is_featured
            })
            .eq('id', id)

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 })
        }

        // Update images if provided
        if (images) {
            // Delete existing images
            await supabase.from('product_images').delete().eq('product_id', id)

            // Insert new images
            if (images.length > 0) {
                const imageRecords = images.map((img: { url: string; alt?: string }, index: number) => ({
                    product_id: id,
                    image_url: img.url,
                    alt_text: img.alt || name,
                    is_primary: index === 0,
                    sort_order: index
                }))
                await supabase.from('product_images').insert(imageRecords)
            }
        }

        // Update variants if provided
        if (variants) {
            // Delete existing variants
            await supabase.from('product_variants').delete().eq('product_id', id)

            // Insert new variants
            if (variants.length > 0) {
                const variantRecords = variants.map((v: { size: string; color: string; color_hex?: string; stock: number; sku?: string }) => ({
                    product_id: id,
                    size: v.size,
                    color: v.color,
                    color_hex: v.color_hex || null,
                    stock_quantity: v.stock || 0,
                    sku: v.sku
                }))
                await supabase.from('product_variants').insert(variantRecords)
            }
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('Update product error:', err)
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
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

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
