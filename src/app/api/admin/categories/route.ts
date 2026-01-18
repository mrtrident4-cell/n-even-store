import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all categories
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Build tree structure
    const rootCategories = categories?.filter(c => !c.parent_id) || []
    const childCategories = categories?.filter(c => c.parent_id) || []

    const tree = rootCategories.map(parent => ({
        ...parent,
        children: childCategories.filter(c => c.parent_id === parent.id)
    }))

    return NextResponse.json({ categories: tree, flat: categories })
}

// CREATE category
export async function POST(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, parent_id, description, image_url } = await request.json()

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data: category, error } = await supabase
        .from('categories')
        .insert({
            name,
            slug: slug + '-' + Date.now(),
            parent_id: parent_id || null,
            description,
            image_url
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, category })
}

// UPDATE category
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, parent_id, description, image_url, is_active, sort_order } = await request.json()

    if (!id) {
        return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('categories')
        .update({
            name,
            parent_id: parent_id || null,
            description,
            image_url,
            is_active,
            sort_order
        })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
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

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
