import { NextRequest, NextResponse } from 'next/server'
import jwt, { Secret, SignOptions } from 'jsonwebtoken'

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'neven-super-secret-jwt-key-2024'

export interface JWTPayload {
    id: string
    email: string
    role: string
    type: 'admin' | 'customer'
}

export function signToken(payload: JWTPayload, expiresIn: string = '7d'): string {
    const options: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    return jwt.sign(payload as object, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        console.log('Verifying token...')
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
        console.log('Token verified for:', decoded.email)
        return decoded
    } catch (err) {
        console.error('Token verification failed:', err instanceof Error ? err.message : err)
        return null
    }
}

export function getTokenFromRequest(request: NextRequest): string | null {
    // Check Authorization header first
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7)
    }

    // Check cookie
    const token = request.cookies.get('admin_token')?.value
    return token || null
}

export function requireAdmin(handler: (request: NextRequest, payload: JWTPayload) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
        const token = getTokenFromRequest(request)

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const payload = verifyToken(token)

        if (!payload || payload.type !== 'admin') {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        return handler(request, payload)
    }
}

export function requireCustomer(handler: (request: NextRequest, payload: JWTPayload) => Promise<NextResponse>) {
    return async (request: NextRequest) => {
        const token = request.cookies.get('customer_token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Please login to continue' }, { status: 401 })
        }

        const payload = verifyToken(token)

        if (!payload || payload.type !== 'customer') {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        }

        return handler(request, payload)
    }
}
