'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './products.module.css'
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Product, Category } from '@/lib/types'

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [page, search, categoryFilter, statusFilter])

    async function fetchProducts() {
        setLoading(true)
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            search,
            category: categoryFilter,
            status: statusFilter
        })

        const res = await fetch(`/api/admin/products?${params}`, {
            credentials: 'include'
        })
        const data = await res.json()

        setProducts(data.products || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setLoading(false)
    }

    async function fetchCategories() {
        const res = await fetch('/api/admin/categories', {
            credentials: 'include'
        })
        const data = await res.json()
        setCategories(data.flat || [])
    }

    async function toggleStatus(product: Product) {
        await fetch(`/api/admin/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ ...product, is_active: !product.is_active })
        })
        fetchProducts()
    }

    async function deleteProduct(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return

        await fetch(`/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' })
        fetchProducts()
    }

    const getStock = (product: Product) => {
        return product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) || 0
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Products</h1>
                    <p className={styles.subtitle}>Manage your product catalog</p>
                </div>
                <Link href="/admin/products/new" className={styles.addBtn}>
                    <Plus size={20} />
                    Add Product
                </Link>
            </header>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        className={styles.searchInput}
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
                    className={styles.select}
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className={styles.select}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="hidden">Hidden</option>
                </select>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className={styles.loading}>Loading products...</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.productImage}>
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0].image_url} alt={product.name} />
                                                ) : (
                                                    <div className={styles.noImage}>No image</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={styles.productName}>{product.name}</p>
                                                <p className={styles.productGender}>{product.gender}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{product.category?.name || '-'}</td>
                                    <td>
                                        <span className={styles.price}>₹{product.price}</span>
                                        {product.compare_price && (
                                            <span className={styles.comparePrice}>₹{product.compare_price}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={getStock(product) < 10 ? styles.lowStock : ''}>
                                            {getStock(product)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.status} ${product.is_active ? styles.active : styles.hidden}`}>
                                            {product.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/admin/products/${product.id}`} className={styles.actionBtn} title="Edit">
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={styles.actionBtn}
                                                title={product.is_active ? 'Hide' : 'Show'}
                                            >
                                                {product.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className={styles.empty}>No products found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={styles.pageBtn}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className={styles.pageBtn}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}
