import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET all settings
export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: settings, error } = await supabase
        .from('store_settings')
        .select('*')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Convert to key-value object
    const settingsObj: Record<string, string> = {}
    settings?.forEach(s => {
        settingsObj[s.key] = s.value || ''
    })

    return NextResponse.json({ settings: settingsObj })
}

// UPDATE settings
export async function PUT(request: NextRequest) {
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || payload.type !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin has settings permission
    const { data: admin } = await supabase
        .from('admins')
        .select('permissions')
        .eq('id', payload.id)
        .single()

    if (!admin?.permissions?.settings) {
        return NextResponse.json({ error: 'You do not have permission to modify settings' }, { status: 403 })
    }

    const settings = await request.json()

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
        await supabase
            .from('store_settings')
            .upsert({ key, value: value as string, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    }

    return NextResponse.json({ success: true })
}
