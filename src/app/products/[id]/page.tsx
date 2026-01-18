'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, Heart, Share2, Ruler, Shield, Truck } from 'lucide-react'
import styles from './product.module.css'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function ProductDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const params = use(paramsPromise)
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [selectedColor, setSelectedColor] = useState<string>('')

    useEffect(() => {
        fetchProduct()
    }, [params.id])

    async function fetchProduct() {
        if (!params?.id) return

        try {
            const docRef = doc(db, 'products', params.id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as any
                setProduct(data)
            } else {
                setProduct(null)
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        }
        setLoading(false)
    }

    if (loading) return <div className={styles.loading}>Loading Masterpiece...</div>
    if (!product) return <div className={styles.empty}>Product not found</div>

    const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url || product.images?.[0]?.image_url

    return (
        <div className={styles.container}>
            <div className={styles.breadcrumb}>
                <Link href="/products" className={styles.backLink}>
                    <ArrowLeft size={16} /> All Collections
                </Link>
            </div>

            <div className={styles.mainGrid}>
                {/* Visuals */}
                <div className={styles.gallery}>
                    <div className={styles.mainImage}>
                        <img src={primaryImage} alt={product.name} />
                    </div>
                    {product.images?.filter((img: any) => !img.is_primary).map((img: any) => (
                        <div key={img.id} className={styles.thumb}>
                            <img src={img.image_url} alt={product.name} />
                        </div>
                    ))}
                </div>

                {/* Details */}
                <div className={styles.info}>
                    <div className={styles.headerInfo}>
                        <span className={styles.cat}>{product.category?.name || 'Collection'}</span>
                        <h1>{product.name}</h1>
                        <div className={styles.priceDisplay}>
                            <span className={styles.price}>₹{Number(product.price).toLocaleString()}</span>
                            {product.compare_price && (
                                <span className={styles.discount}>OFFER</span>
                            )}
                        </div>
                    </div>

                    <p className={styles.desc}>{product.description}</p>

                    <div className={styles.variantSection}>
                        <div className={styles.vGroup}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span className={styles.vTitle}>Select Size</span>
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, textDecoration: 'underline' }}>SIZE GUIDE</span>
                            </div>
                            <div className={styles.sizeSelector}>
                                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                    <button
                                        key={size}
                                        className={styles.sizeChoice}
                                        onClick={() => setSelectedSize(size)}
                                        style={selectedSize === size ? { background: '#000', color: '#fff' } : {}}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button className={styles.bagAction}>
                            Add To Bag <ShoppingBag size={22} />
                        </button>
                    </div>

                    <div className={styles.trustFooter}>
                        <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Truck size={24} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>EXPRESS SHIPPING</p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <Shield size={24} style={{ marginBottom: '0.5rem' }} />
                                <p style={{ fontSize: '0.7rem', fontWeight: 800 }}>AUTHENTICITY GUARANTEED</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
