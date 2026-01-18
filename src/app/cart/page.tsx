import styles from './cart.module.css'
import { ShoppingBag, ArrowLeft, ArrowRight, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Shopping Bag</h1>
                <p className={styles.subtitle}>Review your items and proceed to checkout.</p>
            </header>

            <div className={styles.empty}>
                <div className={styles.icon}><ShoppingBag size={60} strokeWidth={1} /></div>
                <h2>Your bag is currently empty.</h2>
                <p>Seems like you haven&apos;t added anything to your bag yet.</p>
                <Link href="/products" className={styles.cta}>
                    Continue Shopping <ArrowRight size={18} />
                </Link>
            </div>

            {/* In a real app, we would map over cart items here */}
        </div>
    )
}
