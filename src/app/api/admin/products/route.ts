import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all products with filters
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
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    let query = supabase
        .from('products')
        .select(`
      *,
      category:categories(id, name, slug),
      images:product_images(id, image_url, is_primary, sort_order),
      variants:product_variants(id, size, color, color_hex, stock_quantity, sku, is_active)
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    if (search) {
        query = query.ilike('name', `%${search}%`)
    }

    if (category) {
        query = query.eq('category_id', category)
    }

    if (status === 'active') {
        query = query.eq('is_active', true)
    } else if (status === 'hidden') {
        query = query.eq('is_active', false)
    }

    const { data: products, error, count } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
        products,
        pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
        }
    })
}

// CREATE new product
export async function POST(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { name, description, price, compare_price, category_id, gender, is_active, is_featured, images, variants, collections } = body

        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
        }

        // Generate slug
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now()

        // Insert product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert({
                name,
                slug,
                description,
                price: parseFloat(price),
                compare_price: compare_price ? parseFloat(compare_price) : null,
                category_id: category_id || null,
                gender: gender || null,
                is_active: is_active ?? true,
                is_featured: is_featured ?? false
            })
            .select()
            .single()

        if (productError) {
            return NextResponse.json({ error: productError.message }, { status: 500 })
        }

        // Insert images
        if (images && images.length > 0) {
            const imageRecords = images.map((img: { url: string; alt?: string }, index: number) => ({
                product_id: product.id,
                image_url: img.url,
                alt_text: img.alt || name,
                is_primary: index === 0,
                sort_order: index
            }))

            await supabase.from('product_images').insert(imageRecords)
        }

        // Insert variants
        if (variants && variants.length > 0) {
            const variantRecords = variants.map((v: { size: string; color: string; color_hex?: string; stock: number; sku?: string }) => ({
                product_id: product.id,
                size: v.size,
                color: v.color,
                color_hex: v.color_hex || null,
                stock_quantity: v.stock || 0,
                sku: v.sku || `${slug}-${v.size}-${v.color}`.toUpperCase()
            }))

            await supabase.from('product_variants').insert(variantRecords)
        }

        // Link to collections
        if (collections && collections.length > 0) {
            const collectionLinks = collections.map((collectionId: string) => ({
                product_id: product.id,
                collection_id: collectionId
            }))

            await supabase.from('product_collections').insert(collectionLinks)
        }

        return NextResponse.json({ success: true, product })
    } catch (err) {
        console.error('Create product error:', err)
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}
