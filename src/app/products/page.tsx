import styles from './products.module.css'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from '@/components/ProductCard'
import { Filter, ChevronDown } from 'lucide-react'

export const revalidate = 0

export default async function ProductsPage({
    searchParams
}: {
    searchParams: { category?: string; sort?: string; gender?: string }
}) {
    let query = supabase
        .from('products')
        .select(`
            *,
            category:categories(id, name, slug),
            images:product_images(id, image_url, is_primary, sort_order)
        `)
        .eq('is_active', true)

    if (searchParams.category) {
        query = query.eq('category.slug', searchParams.category)
    }

    if (searchParams.gender) {
        query = query.eq('gender', searchParams.gender)
    }

    const { data: products, error } = await query.order('created_at', { ascending: false })

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
                        {searchParams.gender && <span className={styles.tag}>Gender: {searchParams.gender}</span>}
                        {searchParams.category && <span className={styles.tag}>Category: {searchParams.category}</span>}
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
