'use client'

import { useState, useEffect } from 'react'
import styles from './collections.module.css'
import { Plus, Edit, Trash2, Layers, Calendar } from 'lucide-react'
import { Collection } from '@/lib/types'

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        fetchCollections()
    }, [])

    async function fetchCollections() {
        const res = await fetch('/api/admin/collections', {
            credentials: 'include'
        })
        const data = await res.json()
        setCollections(data.collections || [])
        setLoading(false)
    }

    function openModal(collection?: Collection) {
        if (collection) {
            setEditingCollection(collection)
            setName(collection.name)
            setDescription(collection.description || '')
            setImageUrl(collection.image_url || '')
            setStartDate(collection.start_date ? collection.start_date.split('T')[0] : '')
            setEndDate(collection.end_date ? collection.end_date.split('T')[0] : '')
        } else {
            setEditingCollection(null)
            setName('')
            setDescription('')
            setImageUrl('')
            setStartDate('')
            setEndDate('')
        }
        setShowModal(true)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name) return

        const payload = {
            name,
            description,
            image_url: imageUrl || null,
            start_date: startDate || null,
            end_date: endDate || null
        }

        if (editingCollection) {
            await fetch('/api/admin/collections', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id: editingCollection.id, ...payload })
            })
        } else {
            await fetch('/api/admin/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
        }

        setShowModal(false)
        fetchCollections()
    }

    async function toggleActive(collection: Collection) {
        await fetch('/api/admin/collections', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id: collection.id, is_active: !collection.is_active })
        })
        fetchCollections()
    }

    async function deleteCollection(id: string) {
        if (!confirm('Are you sure you want to delete this collection?')) return
        await fetch(`/api/admin/collections?id=${id}`, { method: 'DELETE', credentials: 'include' })
        fetchCollections()
    }

    const formatDate = (date: string | null) => {
        if (!date) return null
        return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Collections</h1>
                    <p className={styles.subtitle}>Group products into themed collections</p>
                </div>
                <button onClick={() => openModal()} className={styles.addBtn}>
                    <Plus size={20} />
                    Add Collection
                </button>
            </header>

            {loading ? (
                <div className={styles.loading}>Loading collections...</div>
            ) : (
                <div className={styles.collectionsGrid}>
                    {collections.map(collection => (
                        <div key={collection.id} className={`${styles.collectionCard} ${!collection.is_active ? styles.inactive : ''}`}>
                            <div className={styles.collectionImage}>
                                {collection.image_url ? (
                                    <img src={collection.image_url} alt={collection.name} />
                                ) : (
                                    <div className={styles.placeholderImage}>
                                        <Layers size={32} />
                                    </div>
                                )}
                            </div>
                            <div className={styles.collectionInfo}>
                                <div className={styles.collectionHeader}>
                                    <h3 className={styles.collectionName}>{collection.name}</h3>
                                    {!collection.is_active && <span className={styles.inactiveBadge}>Hidden</span>}
                                </div>
                                {collection.description && (
                                    <p className={styles.collectionDesc}>{collection.description}</p>
                                )}
                                {(collection.start_date || collection.end_date) && (
                                    <div className={styles.dateRange}>
                                        <Calendar size={14} />
                                        {formatDate(collection.start_date) || 'Start'} - {formatDate(collection.end_date) || 'No end'}
                                    </div>
                                )}
                            </div>
                            <div className={styles.collectionActions}>
                                <button onClick={() => toggleActive(collection)} className={styles.toggleBtn}>
                                    {collection.is_active ? 'Hide' : 'Show'}
                                </button>
                                <button onClick={() => openModal(collection)} className={styles.editBtn}>
                                    <Edit size={14} />
                                </button>
                                <button onClick={() => deleteCollection(collection.id)} className={styles.deleteBtn}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {collections.length === 0 && (
                        <p className={styles.empty}>No collections yet. Create your first collection!</p>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editingCollection ? 'Edit Collection' : 'Create Collection'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Collection Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Summer Sale"
                                    required
                                />
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

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Image URL</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Start Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>End Date</label>
                                    <input
                                        type="date"
                                        className={styles.input}
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    {editingCollection ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
