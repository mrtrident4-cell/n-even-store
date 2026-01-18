'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { ShoppingBag, Search, User } from 'lucide-react'
import { useCustomer } from '@/contexts/CustomerContext'

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const { customer, isAuthenticated } = useCustomer()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    N-EVEN
                </Link>

                <div className={styles.menu}>
                    <Link href="/products" className={styles.link}>Shop</Link>
                    <Link href="/products?gender=men" className={styles.link}>Men</Link>
                    <Link href="/products?gender=women" className={styles.link}>Women</Link>
                    <Link href="/about" className={styles.link}>About</Link>
                </div>

                <div className={styles.actions}>
                    <button className={styles.iconBtn}><Search size={22} strokeWidth={1.5} /></button>

                    {isAuthenticated ? (
                        <Link href="/account" className={styles.iconBtn} title={customer?.name}>
                            <User size={22} strokeWidth={1.5} />
                        </Link>
                    ) : (
                        <Link href="/login" className={styles.loginBtn}>
                            Login
                        </Link>
                    )}

                    <Link href="/cart" className={styles.iconBtn}>
                        <ShoppingBag size={22} strokeWidth={1.5} />
                        <span className={styles.badge}>0</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
