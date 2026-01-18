'use client'

import { useEffect, useState } from 'react'
import styles from './dashboard.module.css'
import {
    DollarSign,
    ShoppingCart,
    Users,
    AlertTriangle,
    TrendingUp,
    Package
} from 'lucide-react'

interface DashboardData {
    totalSalesToday: number
    totalSalesMonth: number
    totalOrders: number
    pendingOrders: number
    totalCustomers: number
    lowStockProducts: number
    recentOrders: Array<{
        id: string
        order_number: string
        total_amount: number
        status: string
        payment_status: string
        created_at: string
    }>
    bestSellers: Array<{ name: string; sold: number }>
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboard()
    }, [])

    async function fetchDashboard() {
        try {
            const res = await fetch('/api/admin/dashboard', {
                credentials: 'include'
            })
            const json = await res.json()
            setData(json)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const statusColors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        packed: '#8b5cf6',
        shipped: '#6366f1',
        delivered: '#10b981',
        cancelled: '#ef4444'
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Dashboard</h1>
                <p className={styles.subtitle}>Welcome back! Here&apos;s what&apos;s happening with your store.</p>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Today&apos;s Sales</p>
                        <h3 className={styles.statValue}>{formatCurrency(data?.totalSalesToday || 0)}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Monthly Sales</p>
                        <h3 className={styles.statValue}>{formatCurrency(data?.totalSalesMonth || 0)}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Total Orders</p>
                        <h3 className={styles.statValue}>{data?.totalOrders || 0}</h3>
                        <span className={styles.statBadge}>{data?.pendingOrders || 0} pending</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Customers</p>
                        <h3 className={styles.statValue}>{data?.totalCustomers || 0}</h3>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className={styles.statInfo}>
                        <p className={styles.statLabel}>Low Stock</p>
                        <h3 className={styles.statValue}>{data?.lowStockProducts || 0}</h3>
                        <span className={styles.statBadge} style={{ background: '#fef3c7', color: '#b45309' }}>Needs attention</span>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Orders */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Recent Orders</h2>
                    <div className={styles.ordersList}>
                        {data?.recentOrders?.length ? (
                            data.recentOrders.map(order => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <p className={styles.orderNumber}>{order.order_number}</p>
                                        <p className={styles.orderDate}>
                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className={styles.orderStatus}>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ background: statusColors[order.status] + '20', color: statusColors[order.status] }}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className={styles.orderAmount}>
                                        {formatCurrency(order.total_amount)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.empty}>No orders yet</p>
                        )}
                    </div>
                </div>

                {/* Best Sellers */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Best Selling Products</h2>
                    <div className={styles.bestSellersList}>
                        {data?.bestSellers?.length ? (
                            data.bestSellers.map((product, index) => (
                                <div key={product.name} className={styles.bestSellerItem}>
                                    <div className={styles.rank}>{index + 1}</div>
                                    <div className={styles.productIcon}>
                                        <Package size={20} />
                                    </div>
                                    <div className={styles.productInfo}>
                                        <p className={styles.productName}>{product.name}</p>
                                        <p className={styles.productSold}>{product.sold} sold</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.empty}>No sales data yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
