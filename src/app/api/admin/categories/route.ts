import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { Category } from '@/lib/types'

// GET all categories
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const snapshot = await adminDb.collection('categories')
            .orderBy('sort_order', 'asc')
            .orderBy('name', 'asc')
            .get();

        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];

        // Build tree structure
        const rootCategories = categories.filter(c => !c.parent_id)
        const childCategories = categories.filter(c => c.parent_id)

        const tree = rootCategories.map(parent => ({
            ...parent,
            children: childCategories.filter(c => c.parent_id === parent.id)
        }))

        return NextResponse.json({ categories: tree, flat: categories })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// CREATE category
export async function POST(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, parent_id, description, image_url } = await request.json()

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        const categoryData = {
            name,
            slug: slug + '-' + Date.now(),
            parent_id: parent_id || null,
            description: description || null,
            image_url: image_url || null,
            is_active: true,
            sort_order: 0,
            created_at: new Date().toISOString()
        };

        const docRef = await adminDb.collection('categories').add(categoryData);

        return NextResponse.json({ success: true, category: { id: docRef.id, ...categoryData } })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// UPDATE category
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id, name, parent_id, description, image_url, is_active, sort_order } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
        }

        const updateData: any = {
            name,
            parent_id: parent_id || null,
            description,
            image_url,
            is_active,
            sort_order
        };

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await adminDb.collection('categories').doc(id).update(updateData);

        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

// DELETE category
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
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    try {
        await adminDb.collection('categories').doc(id).delete();
        return NextResponse.json({ success: true })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
