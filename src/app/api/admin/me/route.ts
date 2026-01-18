import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
    const token = getTokenFromRequest(request)

    if (!token) {
        console.log('No token found in request cookies')
        return NextResponse.json({ authenticated: false, message: 'No session token' }, { status: 401 })
    }

    const payload = verifyToken(token)

    if (!payload || payload.type !== 'admin') {
        console.log('Token invalid or wrong role:', payload)
        return NextResponse.json({ authenticated: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    // Fetch fresh admin data
    const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, name, role, permissions')
        .eq('id', payload.id)
        .single()

    if (error || !admin) {
        console.error('Database lookup failed for admin ID:', payload.id, error)
        return NextResponse.json({ authenticated: false, message: 'User record not found' }, { status: 401 })
    }

    console.log('Admin identified successfully:', admin.email)

    return NextResponse.json({
        authenticated: true,
        admin
    })
}
