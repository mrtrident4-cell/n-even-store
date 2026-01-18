'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdmin } from '@/contexts/AdminContext'
import styles from './AdminSidebar.module.css'
import {
    LayoutDashboard,
    ShoppingBag,
    FolderOpen,
    Layers,
    ShoppingCart,
    Users,
    Ticket,
    Settings,
    LogOut,
    ChevronRight
} from 'lucide-react'

const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { label: 'Collections', href: '/admin/collections', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const { admin, logout } = useAdmin()

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/admin/dashboard">N-EVEN</Link>
                <span className={styles.badge}>Admin</span>
            </div>

            <nav className={styles.nav}>
                {menuItems.map(item => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                            {isActive && <ChevronRight size={16} className={styles.arrow} />}
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.footer}>
                <div className={styles.adminInfo}>
                    <div className={styles.avatar}>{admin?.name?.charAt(0) || 'A'}</div>
                    <div className={styles.adminDetails}>
                        <p className={styles.adminName}>{admin?.name || 'Admin'}</p>
                        <p className={styles.adminRole}>{admin?.role?.replace('_', ' ') || 'Staff'}</p>
                    </div>
                </div>
                <button onClick={logout} className={styles.logoutBtn}>
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    )
}
