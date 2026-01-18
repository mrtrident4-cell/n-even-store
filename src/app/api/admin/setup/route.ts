import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
    try {
        const adminEmail = 'admin@neven.com';
        const adminPass = 'admin123';
        const hashedPassword = await bcrypt.hash(adminPass, 10);

        const adminRef = adminDb.collection('admins').doc(adminEmail);

        await adminRef.set({
            email: adminEmail,
            password_hash: hashedPassword,
            name: 'System Admin',
            role: 'super_admin',
            permissions: ['all'],
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Firebase Admin created successfully! You can now log in with admin@neven.com / admin123'
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
