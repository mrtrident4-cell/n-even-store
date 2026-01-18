'use client'

import { useState, useEffect } from 'react'
import styles from './categories.module.css'
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'
import { Category } from '@/lib/types'

export default function CategoriesPage() {
    const [categories, setCategories] = useState<(Category & { children?: Category[] })[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)

    const [name, setName] = useState('')
    const [parentId, setParentId] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    async function fetchCategories() {
        const res = await fetch('/api/admin/categories', {
            credentials: 'include'
        })
        const data = await res.json()
        setCategories(data.categories || [])
        setLoading(false)
    }

    function openModal(category?: Category) {
        if (category) {
            setEditingCategory(category)
            setName(category.name)
            setParentId(category.parent_id || '')
            setDescription(category.description || '')
        } else {
            setEditingCategory(null)
            setName('')
            setParentId('')
            setDescription('')
        }
        setShowModal(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name) return

        if (editingCategory) {
            await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    id: editingCategory.id,
                    name,
                    parent_id: parentId || null,
                    description
                })
            })
        } else {
            await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, parent_id: parentId || null, description })
            })
        }

        setShowModal(false)
        fetchCategories()
    }

    async function deleteCategory(id: string) {
        if (!confirm('Are you sure you want to delete this category?')) return
        await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE', credentials: 'include' })
        fetchCategories()
    }

    const allCategories = categories.flatMap(c => [c, ...(c.children || [])])

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Categories</h1>
                    <p className={styles.subtitle}>Organize your products into categories</p>
                </div>
                <button onClick={() => openModal()} className={styles.addBtn}>
                    <Plus size={20} />
                    Add Category
                </button>
            </header>

            {loading ? (
                <div className={styles.loading}>Loading categories...</div>
            ) : (
                <div className={styles.categoryGrid}>
                    {categories.map(category => (
                        <div key={category.id} className={styles.categoryCard}>
                            <div className={styles.categoryIcon}>
                                <FolderOpen size={24} />
                            </div>
                            <div className={styles.categoryInfo}>
                                <h3 className={styles.categoryName}>{category.name}</h3>
                                {category.description && (
                                    <p className={styles.categoryDesc}>{category.description}</p>
                                )}
                                {category.children && category.children.length > 0 && (
                                    <div className={styles.subcategories}>
                                        {category.children.map(sub => (
                                            <span key={sub.id} className={styles.subcategoryTag}>
                                                {sub.name}
                                                <button onClick={() => deleteCategory(sub.id)} className={styles.subDelete}>×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className={styles.categoryActions}>
                                <button onClick={() => openModal(category)} className={styles.actionBtn}>
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => deleteCategory(category.id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className={styles.empty}>No categories yet. Create your first category!</p>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Category Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. T-Shirts"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Parent Category (optional)</label>
                                <select
                                    className={styles.select}
                                    value={parentId}
                                    onChange={e => setParentId(e.target.value)}
                                >
                                    <option value="">None (Top Level)</option>
                                    {allCategories.filter(c => c.id !== editingCategory?.id).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Optional description..."
                                    rows={3}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
