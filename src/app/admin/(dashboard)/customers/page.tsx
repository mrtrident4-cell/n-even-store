'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './customers.module.css'
import {
    Search,
    Filter,
    MoreHorizontal,
    User,
    Mail,
    Phone,
    Calendar,
    CheckCircle,
    XCircle,
    Slash,
    Eye
} from 'lucide-react'

interface Customer {
    id: string
    name: string
    email?: string
    phone: string
    is_active: boolean
    created_at: string
    orders_count?: number
}

export default function CustomersPage() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    // Action menu state
    const [actionMenu, setActionMenu] = useState<string | null>(null)

    useEffect(() => {
        fetchCustomers()
    }, [page, search, statusFilter])

    async function fetchCustomers() {
        setLoading(true)
        try {
            const query = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                search,
                status: statusFilter === 'all' ? '' : statusFilter
            })

            const res = await fetch(`/api/admin/customers?${query}`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                setCustomers(data.customers)
                setTotalPages(data.pagination.totalPages)
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error)
        } finally {
            setLoading(false)
        }
    }

    async function toggleCustomerStatus(id: string, currentStatus: boolean) {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this customer?`)) return

        try {
            const res = await fetch('/api/admin/customers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id,
                    is_active: !currentStatus
                })
            })

            if (res.ok) {
                fetchCustomers()
            } else {
                alert('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating customer:', error)
            alert('Error updating customer')
        }
        setActionMenu(null)
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Customers</h1>
                    <p>Manage store customers and their accounts</p>
                </div>
            </header>

            <div className={styles.toolbar}>
                <div className={styles.search}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
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
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Contact Info</th>
                                <th>Joined Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className={styles.loading}>
                                        Loading customers...
                                    </td>
                                </tr>
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className={styles.empty}>
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                customers.map(customer => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>
                                                    {customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{customer.name}</span>
                                                    <span className={styles.userId}>ID: {customer.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.contactInfo}>
                                                <div title="Phone">
                                                    <Phone size={14} /> {customer.phone}
                                                </div>
                                                {customer.email && (
                                                    <div title="Email">
                                                        <Mail size={14} /> {customer.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.dateCell}>
                                                <Calendar size={14} />
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${customer.is_active ? styles.active : styles.suspended}`}>
                                                {customer.is_active ? (
                                                    <><CheckCircle size={12} /> Active</>
                                                ) : (
                                                    <><XCircle size={12} /> Suspended</>
                                                )}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => setActionMenu(actionMenu === customer.id ? null : customer.id)}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {actionMenu === customer.id && (
                                                    <div className={styles.dropdown}>
                                                        <button onClick={() => router.push(`/admin/orders?customer_id=${customer.id}`)}>
                                                            <Eye size={16} /> View Orders
                                                        </button>
                                                        <button
                                                            onClick={() => toggleCustomerStatus(customer.id, customer.is_active)}
                                                            className={customer.is_active ? styles.danger : styles.success}
                                                        >
                                                            <Slash size={16} />
                                                            {customer.is_active ? 'Suspend User' : 'Activate User'}
                                                        </button>
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
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}
