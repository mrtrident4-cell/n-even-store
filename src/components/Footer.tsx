'use client'

import Link from 'next/link'
import styles from './Footer.module.css'
import { Instagram, Twitter, Facebook, ArrowUp } from 'lucide-react'

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.top}>
                <div className={styles.brand}>
                    <h2 className={styles.logo}>N-EVEN</h2>
                    <p className={styles.about}>Modern clothing for the modern generation. Curated with precision and crafted for longevity.</p>
                    <div className={styles.socials}>
                        <Link href="#"><Instagram size={20} /></Link>
                        <Link href="#"><Twitter size={20} /></Link>
                        <Link href="#"><Facebook size={20} /></Link>
                    </div>
                </div>

                <div className={styles.linksGrid}>
                    <div className={styles.group}>
                        <h3>Shop</h3>
                        <Link href="/products">All Products</Link>
                        <Link href="/products?gender=men">Men</Link>
                        <Link href="/products?gender=women">Women</Link>
                        <Link href="/products?category=accessories">Accessories</Link>
                    </div>
                    <div className={styles.group}>
                        <h3>Help</h3>
                        <Link href="/contact">Contact Us</Link>
                        <Link href="/about">About</Link>
                        <Link href="/shipping">Shipping</Link>
                        <Link href="/returns">Returns</Link>
                    </div>
                    <div className={styles.group}>
                        <h3>Account</h3>
                        <Link href="/account">My Account</Link>
                        <Link href="/cart">Shopping Bag</Link>
                        <Link href="/account">Order History</Link>
                    </div>
                </div>

                <div className={styles.newsletter}>
                    <h3>Join the club</h3>
                    <p>Subscribe to receive updates, access to exclusive deals, and more.</p>
                    <form className={styles.form}>
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className={styles.bottom}>
                <p>© 2025 N-EVEN. All rights reserved.</p>
                <div className={styles.legal}>
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms of Service</Link>
                </div>
                <button onClick={scrollToTop} className={styles.backTop}>
                    Back to top <ArrowUp size={16} />
                </button>
            </div>
        </footer>
    )
}
