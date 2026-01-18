'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import styles from './orders.module.css'
import {
    Search,
    Filter,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    User,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react'

// Wrap component in Suspense for useSearchParams
export default function OrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersContent />
        </Suspense>
    )
}

function OrdersContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Filters from URL
    const customerId = searchParams.get('customer_id')

    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Status update menu
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [page, search, statusFilter, customerId])

    async function fetchOrders() {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
                status: statusFilter,
            })

            if (customerId) {
                query.append('customer_id', customerId)
            }

            const res = await fetch(`/api/admin/orders?${query}`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setOrders(data.orders)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error)
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(orderId: string, newStatus: string) {
        if (!confirm(`Update order status to ${newStatus}?`)) return

        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: orderId,
                    status: newStatus
                })
            })

            if (res.ok) {
                fetchOrders()
            } else {
                alert('Failed to update status')
            }
        } catch (error) {
            alert('Error updating order')
        }
        setActiveMenu(null)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'delivered': return <span className={`${styles.badge} ${styles.success}`}><CheckCircle size={12} /> Delivered</span>
            case 'shipped': return <span className={`${styles.badge} ${styles.info}`}><Truck size={12} /> Shipped</span>
            case 'cancelled': return <span className={`${styles.badge} ${styles.danger}`}><XCircle size={12} /> Cancelled</span>
            case 'on_hold': return <span className={`${styles.badge} ${styles.warning}`}><Clock size={12} /> On Hold</span>
            default: return <span className={`${styles.badge} ${styles.neutral}`}><Package size={12} /> Processing</span>
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Orders</h1>
                    {customerId ? (
                        <p>Showing orders for customer {orders[0]?.customer?.name || '...'}</p>
                    ) : (
                        <p>Manage and track store orders</p>
                    )}
                </div>
                {customerId && (
                    <button onClick={() => router.push('/admin/orders')} className={styles.clearBtn}>
                        Clear Customer Filter
                    </button>
                )}
            </header>

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    <Filter size={20} />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="processed">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="on_hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className={styles.loading}>Loading orders...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className={styles.empty}>No orders found</td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td className={styles.idCell}>#{order.id.slice(0, 8)}</td>
                                        <td>
                                            <div className={styles.customerCell}>
                                                <User size={14} />
                                                <span>{order.customer?.name || 'Unknown'}</span>
                                            </div>
                                            <div className={styles.subText}>{order.customer?.phone}</div>
                                        </td>
                                        <td className={styles.dateCell}>
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </td>
                                        <td className={styles.priceCell}>
                                            ₹{order.total_amount.toLocaleString()}
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td>
                                            <span className={styles.itemCount}>
                                                {order.items?.length || 0} items
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeMenu === order.id && (
                                                    <div className={styles.dropdown}>
                                                        <div className={styles.dropdownHeader}>Update Status</div>
                                                        <button onClick={() => updateStatus(order.id, 'processed')}>Processing</button>
                                                        <button onClick={() => updateStatus(order.id, 'shipped')}>Shipped</button>
                                                        <button onClick={() => updateStatus(order.id, 'delivered')}>Delivered</button>
                                                        <button onClick={() => updateStatus(order.id, 'on_hold')} className={styles.warningBtn}>Hold</button>
                                                        <button onClick={() => updateStatus(order.id, 'cancelled')} className={styles.dangerBtn}>Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.pagination}>
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>
        </div>
    )
}
