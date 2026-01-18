import Link from 'next/link'
import styles from './ProductCard.module.css'
import { Plus } from 'lucide-react'

interface ProductCardProps {
    product: any
}

export default function ProductCard({ product }: ProductCardProps) {
    const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url
        || product.images?.[0]?.image_url
        || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'

    const discount = product.compare_price && product.compare_price > product.price
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : null

    return (
        <Link href={`/products/${product.id}`} className={styles.card}>
            <div className={styles.imageWrapper}>
                {discount && <span className={styles.saleBadge}>-{discount}%</span>}
                <img
                    src={primaryImage}
                    alt={product.name}
                    className={styles.image}
                    loading="lazy"
                />
                <div className={styles.overlay}>
                    <button className={styles.quickAdd}>
                        <Plus size={14} /> Quick Add
                    </button>
                </div>
            </div>

            <div className={styles.info}>
                <div>
                    <h3 className={styles.name}>{product.name}</h3>
                    <p className={styles.category}>{product.category?.name || 'Collection'}</p>
                </div>
                <div className={styles.price}>
                    ₹{Number(product.price).toLocaleString()}
                </div>
            </div>
        </Link>
    )
}
