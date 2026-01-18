import styles from './products.module.css'
import { adminDb } from '@/lib/firebaseAdmin'
import ProductCard from '@/components/ProductCard'
import { Filter, ChevronDown } from 'lucide-react'
import { Product } from '@/lib/types'

export const revalidate = 0

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ category?: string; sort?: string; gender?: string }>
}) {
    const params = await searchParams; // Await params in Next.js 15+

    let query: FirebaseFirestore.Query = adminDb.collection('products')
        .where('is_active', '==', true)

    if (params.gender) {
        query = query.where('gender', '==', params.gender)
    }

    let categoryId = null;
    if (params.category) {
        const catSnap = await adminDb.collection('categories')
            .where('slug', '==', params.category)
            .limit(1)
            .get();
        if (!catSnap.empty) {
            categoryId = catSnap.docs[0].id;
            query = query.where('category_id', '==', categoryId);
        }
    }

    const snapshot = await query.orderBy('created_at', 'desc').get();

    // Convert to plain object list
    const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as Product[]

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>All Collections</h1>
                    <p className={styles.subtitle}>{products?.length || 0} Products available</p>
                </div>
            </header>

            <div className={styles.filtersBar}>
                <div className={styles.filterGroup}>
                    <button className={styles.filterBtn}>
                        <Filter size={18} /> Filters
                    </button>
                    <div className={styles.activeFilters}>
                        {params.gender && <span className={styles.tag}>Gender: {params.gender}</span>}
                        {params.category && <span className={styles.tag}>Category: {params.category}</span>}
                    </div>
                </div>

                <div className={styles.sortGroup}>
                    <span>Sort by:</span>
                    <button className={styles.sortBtn}>
                        Newest Arrivals <ChevronDown size={18} />
                    </button>
                </div>
            </div>

            {products && products.length > 0 ? (
                <div className={styles.grid}>
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className={styles.empty}>
                    <h2>No products found</h2>
                    <p>Try adjusting your filters or check back later.</p>
                </div>
            )}
        </div>
    )
}
