'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Admin } from '@/lib/types'

interface AdminContextType {
    admin: Admin | null
    loading: boolean
    logout: () => Promise<void>
    refreshAdmin: () => Promise<void>
}

const AdminContext = createContext<AdminContextType>({
    admin: null,
    loading: true,
    logout: async () => { },
    refreshAdmin: async () => { }
})

export function useAdmin() {
    return useContext(AdminContext)
}

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    async function checkAuth() {
        try {
            const res = await fetch('/api/admin/me')
            const data = await res.json()

            if (data.authenticated && data.admin) {
                setAdmin(data.admin)
            } else {
                setAdmin(null)
            }
        } catch {
            setAdmin(null)
        } finally {
            setLoading(false)
        }
    }

    async function logout() {
        await fetch('/api/admin/logout', { method: 'POST' })
        setAdmin(null)
        router.push('/admin/login')
    }

    async function refreshAdmin() {
        await checkAuth()
    }

    useEffect(() => {
        checkAuth()
    }, [])

    // Protect routes separately
    useEffect(() => {
        if (loading) return

        const isLoginPage = pathname.includes('/admin/login')

        if (!admin && !isLoginPage) {
            router.push('/admin/login')
        } else if (admin && isLoginPage) {
            router.push('/admin/dashboard')
        }
    }, [pathname, admin, loading])

    return (
        <AdminContext.Provider value={{ admin, loading, logout, refreshAdmin }}>
            {children}
        </AdminContext.Provider>
    )
}
