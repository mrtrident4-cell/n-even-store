'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './account.module.css'
import { useCustomer } from '@/contexts/CustomerContext'
import { User, Package, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react'

export default function AccountPage() {
    const router = useRouter()
    const { customer, isLoading, isAuthenticated, logout } = useCustomer()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isLoading, isAuthenticated, router])

    async function handleLogout() {
        await logout()
        router.push('/')
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading...</div>
    }

    if (!customer) {
        return null
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>My Account</h1>
                <p className={styles.subtitle}>Welcome back, {customer.name}!</p>
            </header>

            <div className={styles.grid}>
                <div className={styles.sidebar}>
                    <div className={styles.profileCard}>
                        <div className={styles.avatar}>
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.profileInfo}>
                            <h3>{customer.name}</h3>
                            <p>{customer.phone}</p>
                        </div>
                    </div>

                    <nav className={styles.nav}>
                        <Link href="/account" className={`${styles.navItem} ${styles.active}`}>
                            <User size={20} />
                            <span>Profile</span>
                            <ChevronRight size={16} />
                        </Link>
                        <Link href="/account/orders" className={styles.navItem}>
                            <Package size={20} />
                            <span>My Orders</span>
                            <ChevronRight size={16} />
                        </Link>
                        <Link href="/account/wishlist" className={styles.navItem}>
                            <Heart size={20} />
                            <span>Wishlist</span>
                            <ChevronRight size={16} />
                        </Link>
                        <Link href="/account/addresses" className={styles.navItem}>
                            <MapPin size={20} />
                            <span>Addresses</span>
                            <ChevronRight size={16} />
                        </Link>
                        <button onClick={handleLogout} className={`${styles.navItem} ${styles.logoutBtn}`}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </nav>
                </div>

                <div className={styles.content}>
                    <div className={styles.card}>
                        <h2>Profile Information</h2>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Full Name</label>
                                <p>{customer.name}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone Number</label>
                                <p>{customer.phone}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email</label>
                                <p>{customer.email || 'Not added'}</p>
                            </div>
                        </div>
                        <button className={styles.editBtn}>Edit Profile</button>
                    </div>

                    <div className={styles.card}>
                        <h2>Recent Orders</h2>
                        <div className={styles.emptyState}>
                            <Package size={48} strokeWidth={1} />
                            <p>No orders yet</p>
                            <Link href="/products" className={styles.shopBtn}>
                                Start Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
