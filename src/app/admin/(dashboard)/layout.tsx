'use client'

import { useAdmin } from '@/contexts/AdminContext'
import AdminSidebar from '@/components/admin/AdminSidebar'
import styles from './adminLayout.module.css'

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { admin, loading } = useAdmin()

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        )
    }

    if (!admin) {
        return null // Will redirect in AdminContext
    }

    return (
        <div className={styles.layout}>
            <AdminSidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    )
}
