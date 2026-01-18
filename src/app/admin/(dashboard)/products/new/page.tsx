'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './productForm.module.css'
import { Category, Collection } from '@/lib/types'
import { ArrowLeft, Plus, X, ImageIcon } from 'lucide-react'
import Link from 'next/link'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
const COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1e3a5f' },
    { name: 'Grey', hex: '#808080' },
    { name: 'Red', hex: '#dc2626' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#16a34a' },
    { name: 'Beige', hex: '#d4c4a8' },
]

interface Variant {
    size: string
    color: string
    color_hex: string
    stock: number
    sku: string
}

interface ProductImage {
    url: string
    alt: string
}

export default function NewProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [collections, setCollections] = useState<Collection[]>([])

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [comparePrice, setComparePrice] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [gender, setGender] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [isFeatured, setIsFeatured] = useState(false)
    const [selectedCollections, setSelectedCollections] = useState<string[]>([])

    const [images, setImages] = useState<ProductImage[]>([])
    const [imageUrl, setImageUrl] = useState('')

    const [variants, setVariants] = useState<Variant[]>([])
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [variantStock, setVariantStock] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const [catRes, colRes] = await Promise.all([
            fetch('/api/admin/categories', { credentials: 'include' }),
            fetch('/api/admin/collections', { credentials: 'include' })
        ])
        const catData = await catRes.json()
        const colData = await colRes.json()
        setCategories(catData.flat || [])
        setCollections(colData.collections || [])
    }

    function addImage() {
        if (!imageUrl) return
        setImages([...images, { url: imageUrl, alt: name }])
        setImageUrl('')
    }

    function removeImage(index: number) {
        setImages(images.filter((_, i) => i !== index))
    }

    function addVariant() {
        if (!selectedSize || !selectedColor) return
        const color = COLORS.find(c => c.name === selectedColor)
        const exists = variants.some(v => v.size === selectedSize && v.color === selectedColor)
        if (exists) {
            alert('This variant already exists')
            return
        }
        setVariants([...variants, {
            size: selectedSize,
            color: selectedColor,
            color_hex: color?.hex || '',
            stock: parseInt(variantStock) || 0,
            sku: ''
        }])
        setSelectedSize('')
        setSelectedColor('')
        setVariantStock('')
    }

    function removeVariant(index: number) {
        setVariants(variants.filter((_, i) => i !== index))
    }

    function toggleCollection(id: string) {
        setSelectedCollections(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name || !price) {
            alert('Name and price are required')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/admin/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    description,
                    price,
                    compare_price: comparePrice || null,
                    category_id: categoryId || null,
                    gender: gender || null,
                    is_active: isActive,
                    is_featured: isFeatured,
                    images,
                    variants,
                    collections: selectedCollections
                })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Failed to create product')
                setLoading(false)
                return
            }

            router.push('/admin/products')
        } catch {
            alert('Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/admin/products" className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Back to Products
                </Link>
                <h1 className={styles.title}>Add New Product</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.grid}>
                    {/* Left Column - Main Info */}
                    <div className={styles.mainColumn}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Basic Information</h2>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Product Name *</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="e.g. Essential Oversized Tee"
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Description</label>
                                <textarea
                                    className={styles.textarea}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Product details, materials, care instructions..."
                                    rows={4}
                                />
                            </div>

                            <div className={styles.row}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Price (₹) *</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={price}
                                        onChange={e => setPrice(e.target.value)}
                                        placeholder="1499"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.label}>Compare Price (₹)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        value={comparePrice}
                                        onChange={e => setComparePrice(e.target.value)}
                                        placeholder="1999"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Images</h2>

                            <div className={styles.imageUpload}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    placeholder="Enter image URL..."
                                />
                                <button type="button" onClick={addImage} className={styles.addImageBtn}>
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className={styles.imageGrid}>
                                {images.map((img, index) => (
                                    <div key={index} className={styles.imageItem}>
                                        <img src={img.url} alt={img.alt} />
                                        <button type="button" onClick={() => removeImage(index)} className={styles.removeImageBtn}>
                                            <X size={14} />
                                        </button>
                                        {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className={styles.imagePlaceholder}>
                                        <ImageIcon size={32} />
                                        <p>No images added</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Variants */}
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Variants (Size & Color)</h2>

                            <div className={styles.variantForm}>
                                <select
                                    value={selectedSize}
                                    onChange={e => setSelectedSize(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select Size</option>
                                    {SIZES.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedColor}
                                    onChange={e => setSelectedColor(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select Color</option>
                                    {COLORS.map(color => (
                                        <option key={color.name} value={color.name}>{color.name}</option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    className={styles.input}
                                    value={variantStock}
                                    onChange={e => setVariantStock(e.target.value)}
                                    placeholder="Stock qty"
                                    style={{ maxWidth: '100px' }}
                                />

                                <button type="button" onClick={addVariant} className={styles.addVariantBtn}>
                                    <Plus size={18} /> Add
                                </button>
                            </div>

                            <div className={styles.variantsList}>
                                {variants.map((variant, index) => (
                                    <div key={index} className={styles.variantItem}>
                                        <span
                                            className={styles.colorDot}
                                            style={{ background: variant.color_hex }}
                                        />
                                        <span className={styles.variantSize}>{variant.size}</span>
                                        <span className={styles.variantColor}>{variant.color}</span>
                                        <span className={styles.variantStock}>Stock: {variant.stock}</span>
                                        <button type="button" onClick={() => removeVariant(index)} className={styles.removeVariantBtn}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {variants.length === 0 && (
                                    <p className={styles.noVariants}>No variants added. Add size/color combinations above.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Settings */}
                    <div className={styles.sideColumn}>
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Organization</h2>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Category</label>
                                <select
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="">Select gender</option>
                                    <option value="men">Men</option>
                                    <option value="women">Women</option>
                                    <option value="kids">Kids</option>
                                    <option value="unisex">Unisex</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Collections</h2>
                            <div className={styles.collectionsList}>
                                {collections.map(col => (
                                    <label key={col.id} className={styles.collectionItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCollections.includes(col.id)}
                                            onChange={() => toggleCollection(col.id)}
                                        />
                                        <span>{col.name}</span>
                                    </label>
                                ))}
                                {collections.length === 0 && (
                                    <p className={styles.noCollections}>No collections available</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>Status</h2>

                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={e => setIsActive(e.target.checked)}
                                />
                                <span className={styles.toggleSlider}></span>
                                <span className={styles.toggleLabel}>Active (visible on store)</span>
                            </label>

                            <label className={styles.toggle}>
                                <input
                                    type="checkbox"
                                    checked={isFeatured}
                                    onChange={e => setIsFeatured(e.target.checked)}
                                />
                                <span className={styles.toggleSlider}></span>
                                <span className={styles.toggleLabel}>Featured product</span>
                            </label>
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'Creating...' : 'Create Product'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
