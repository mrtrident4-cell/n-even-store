'use client'

import { useState, useEffect } from 'react'
import styles from './coupons.module.css'
import { Plus, Edit, Trash2, Percent, DollarSign, Calendar } from 'lucide-react'
import { Coupon } from '@/lib/types'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

    const [code, setCode] = useState('')
    const [description, setDescription] = useState('')
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
    const [discountValue, setDiscountValue] = useState('')
    const [minOrderAmount, setMinOrderAmount] = useState('')
    const [maxDiscountAmount, setMaxDiscountAmount] = useState('')
    const [usageLimit, setUsageLimit] = useState('')
    const [expiresAt, setExpiresAt] = useState('')

    useEffect(() => {
        fetchCoupons()
    }, [])

    async function fetchCoupons() {
        const res = await fetch('/api/admin/coupons', {
            credentials: 'include'
        })
        const data = await res.json()
        setCoupons(data.coupons || [])
        setLoading(false)
    }

    function openModal(coupon?: Coupon) {
        if (coupon) {
            setEditingCoupon(coupon)
            setCode(coupon.code)
            setDescription(coupon.description || '')
            setDiscountType(coupon.discount_type)
            setDiscountValue(coupon.discount_value.toString())
            setMinOrderAmount(coupon.min_order_amount.toString())
            setMaxDiscountAmount(coupon.max_discount_amount?.toString() || '')
            setUsageLimit(coupon.usage_limit?.toString() || '')
            setExpiresAt(coupon.expires_at ? coupon.expires_at.split('T')[0] : '')
        } else {
            setEditingCoupon(null)
            setCode('')
            setDescription('')
            setDiscountType('percentage')
            setDiscountValue('')
            setMinOrderAmount('')
            setMaxDiscountAmount('')
            setUsageLimit('')
            setExpiresAt('')
        }
        setShowModal(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!code || !discountValue) return

        const payload = {
            code,
            description,
            discount_type: discountType,
            discount_value: discountValue,
            min_order_amount: minOrderAmount || '0',
            max_discount_amount: maxDiscountAmount || null,
            usage_limit: usageLimit || null,
            expires_at: expiresAt || null
        }

        if (editingCoupon) {
            await fetch('/api/admin/coupons', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: editingCoupon.id, ...payload })
            })
        } else {
            await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
        }

        setShowModal(false)
        fetchCoupons()
    }

    async function toggleActive(coupon: Coupon) {
        await fetch('/api/admin/coupons', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active })
        })
        fetchCoupons()
    }

    async function deleteCoupon(id: string) {
        if (!confirm('Are you sure you want to delete this coupon?')) return
        await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE', credentials: 'include' })
        fetchCoupons()
    }

    const formatDate = (date: string | null) => {
        if (!date) return 'No expiry'
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const isExpired = (date: string | null) => {
        if (!date) return false
        return new Date(date) < new Date()
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Coupons</h1>
                    <p className={styles.subtitle}>Create and manage discount codes</p>
                </div>
                <button onClick={() => openModal()} className={styles.addBtn}>
                    <Plus size={20} />
                    Add Coupon
                </button>
            </header>

            {loading ? (
                <div className={styles.loading}>Loading coupons...</div>
            ) : (
                <div className={styles.couponsGrid}>
                    {coupons.map(coupon => (
                        <div key={coupon.id} className={`${styles.couponCard} ${!coupon.is_active || isExpired(coupon.expires_at) ? styles.inactive : ''}`}>
                            <div className={styles.couponHeader}>
                                <div className={styles.couponIcon}>
                                    {coupon.discount_type === 'percentage' ? <Percent size={20} /> : <DollarSign size={20} />}
                                </div>
                                <div className={styles.couponCode}>{coupon.code}</div>
                                {!coupon.is_active && <span className={styles.disabledBadge}>Disabled</span>}
                                {isExpired(coupon.expires_at) && <span className={styles.expiredBadge}>Expired</span>}
                            </div>

                            <div className={styles.couponValue}>
                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                            </div>

                            {coupon.description && (
                                <p className={styles.couponDesc}>{coupon.description}</p>
                            )}

                            <div className={styles.couponDetails}>
                                {coupon.min_order_amount > 0 && (
                                    <span>Min order: ₹{coupon.min_order_amount}</span>
                                )}
                                {coupon.usage_limit && (
                                    <span>Uses: {coupon.used_count}/{coupon.usage_limit}</span>
                                )}
                                <span className={styles.expiryDate}>
                                    <Calendar size={14} />
                                    {formatDate(coupon.expires_at)}
                                </span>
                            </div>

                            <div className={styles.couponActions}>
                                <button onClick={() => toggleActive(coupon)} className={styles.toggleBtn}>
                                    {coupon.is_active ? 'Disable' : 'Enable'}
                                </button>
                                <button onClick={() => openModal(coupon)} className={styles.editBtn}>
                                    <Edit size={14} />
                                </button>
                                <button onClick={() => deleteCoupon(coupon.id)} className={styles.deleteBtn}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {coupons.length === 0 && (
                        <p className={styles.empty}>No coupons yet. Create your first coupon!</p>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Coupon Code</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. SUMMER20"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Description</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g. Summer sale discount"
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Discount Type</label>
                                    <select
                                        className={styles.select}
                                        value={discountType}
                                        onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Discount Value</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={discountValue}
                                        onChange={e => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'percentage' ? '20' : '500'}
                                        required
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Min Order Amount (₹)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={minOrderAmount}
                                        onChange={e => setMinOrderAmount(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Max Discount (₹)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={maxDiscountAmount}
                                        onChange={e => setMaxDiscountAmount(e.target.value)}
                                        placeholder="No max"
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Usage Limit</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={usageLimit}
                                        onChange={e => setUsageLimit(e.target.value)}
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Expiry Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={expiresAt}
                                        onChange={e => setExpiresAt(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingCoupon ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
