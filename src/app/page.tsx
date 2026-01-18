import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import { supabase } from '@/lib/supabaseClient'
import ProductCard from '@/components/ProductCard'
import { ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react'

export const revalidate = 0

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name),
      images:product_images(image_url, is_primary)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div
          className={styles.heroBackground}
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop)`
          }}
        />
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>New Season 2025</span>
          <h1 className={styles.heroTitle}>
            Elevate Your<br />Style Game
          </h1>
          <p className={styles.heroSubtitle}>
            Discover curated collections that define modern elegance
          </p>
          <div className={styles.heroCtas}>
            <Link href="/products" className={styles.primaryBtn}>
              Shop Collection <ArrowRight size={18} />
            </Link>
            <Link href="/about" className={styles.secondaryBtn}>
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className={styles.trustBar}>
        <div className={styles.trustItem}>
          <Truck size={24} />
          <span>Free Shipping Over $100</span>
        </div>
        <div className={styles.trustItem}>
          <Shield size={24} />
          <span>Secure Payment</span>
        </div>
        <div className={styles.trustItem}>
          <RotateCcw size={24} />
          <span>30-Day Returns</span>
        </div>
      </section>

      {/* Categories Grid */}
      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <h2>Shop By Category</h2>
          <Link href="/products" className={styles.viewAllLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.categoriesGrid}>
          <Link href="/products?gender=men" className={styles.categoryCard}>
            <div
              className={styles.categoryImage}
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?q=80&w=800&auto=format&fit=crop)`
              }}
            />
            <div className={styles.categoryOverlay}>
              <h3>Men</h3>
              <span>Shop Now</span>
            </div>
          </Link>
          <Link href="/products?gender=women" className={styles.categoryCard}>
            <div
              className={styles.categoryImage}
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop)`
              }}
            />
            <div className={styles.categoryOverlay}>
              <h3>Women</h3>
              <span>Shop Now</span>
            </div>
          </Link>
          <Link href="/products?category=accessories" className={styles.categoryCard}>
            <div
              className={styles.categoryImage}
              style={{
                backgroundImage: `url(https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop)`
              }}
            />
            <div className={styles.categoryOverlay}>
              <h3>Accessories</h3>
              <span>Shop Now</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <h2>New Arrivals</h2>
          <Link href="/products" className={styles.viewAllLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.productsGrid}>
          {products && products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className={styles.noProducts}>No products available yet.</p>
          )}
        </div>
      </section>

      {/* Banner Section */}
      <section className={styles.banner}>
        <div
          className={styles.bannerBackground}
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600&auto=format&fit=crop)`
          }}
        />
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <h2>The Art of Minimalism</h2>
          <p>Less is more. Discover pieces that speak volumes through simplicity.</p>
          <Link href="/about" className={styles.bannerBtn}>
            Learn More <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContent}>
          <h2>Stay in the Loop</h2>
          <p>Subscribe for exclusive offers, new arrivals, and style inspiration.</p>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
  )
}
