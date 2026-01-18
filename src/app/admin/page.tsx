'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRedirectPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/admin/login')
    }, [router])

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5'
        }}>
            <p>Redirecting...</p>
        </div>
    )
}
