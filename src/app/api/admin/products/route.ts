import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
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

    try {
        let query: FirebaseFirestore.Query = adminDb.collection('products')

        if (status === 'active') {
            query = query.where('is_active', '==', true)
        } else if (status === 'hidden') {
            query = query.where('is_active', '==', false)
        }

        if (category) {
            query = query.where('category_id', '==', category)
        }

        // Firestore cursor-based pagination is ideal, but we'll use offset for now (inefficient for large datasets but works for admin)
        // Note: Firestore doesn't support offset well. We usually fetch all and slice, or use startAfter.
        // For simple admin dashboard, let's fetch matching docs.

        let snapshot = await query.orderBy('created_at', 'desc').get();
        let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

        // Filter by search term in memory (Firestore lacks full-text search)
        if (search) {
            const lowerSearch = search.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(lowerSearch));
        }

        const total = products.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedProducts = products.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            products: paginatedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        })
    } catch (err: any) {
        console.error('Fetch products error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
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

        // Prepare data
        const productData = {
            name,
            slug,
            description,
            price: parseFloat(price),
            compare_price: compare_price ? parseFloat(compare_price) : null,
            category_id: category_id || null,
            gender: gender || null,
            is_active: is_active ?? true,
            is_featured: is_featured ?? false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),

            // Embed images directly
            images: images && images.length > 0 ? images.map((img: { url: string; alt?: string }, index: number) => ({
                id: `img-${Date.now()}-${index}`,
                image_url: img.url,
                alt_text: img.alt || name,
                is_primary: index === 0,
                sort_order: index
            })) : [],

            // Embed variants directly
            variants: variants && variants.length > 0 ? variants.map((v: { size: string; color: string; color_hex?: string; stock: number; sku?: string }, index: number) => ({
                id: `var-${Date.now()}-${index}`,
                size: v.size,
                color: v.color,
                color_hex: v.color_hex || null,
                stock_quantity: v.stock || 0,
                sku: v.sku || `${slug}-${v.size}-${v.color}`.toUpperCase(),
                is_active: true
            })) : [],

            // Store collection IDs as array
            collections: collections || []
        }

        const docRef = await adminDb.collection('products').add(productData);

        return NextResponse.json({
            success: true,
            product: { id: docRef.id, ...productData }
        })
    } catch (err: any) {
        console.error('Create product error:', err)
        return NextResponse.json({ error: 'Failed to create product: ' + err.message }, { status: 500 })
    }
}
