import styles from './about.module.css'

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>About N-EVEN</h1>
                <p className={styles.subtitle}>
                    Quality essentials, fair prices, no compromises.
                </p>
            </header>

            <section className={styles.content}>
                <div className={styles.imageBlock}>
                    <img
                        src="https://images.unsplash.com/photo-1558171813-4c088753af8f?q=80&w=800&auto=format&fit=crop"
                        alt="N-EVEN Studio"
                    />
                </div>
                <div className={styles.textBlock}>
                    <h2>Our Mission</h2>
                    <p>
                        N-EVEN was founded with a simple goal: to create high-quality clothing at honest prices.
                        We cut out the middlemen and sell directly to you, passing on the savings.
                    </p>
                    <p>
                        Every piece is designed to last, made from carefully sourced materials,
                        and crafted with attention to detail. Simple as that.
                    </p>
                </div>
            </section>

            <section className={styles.content}>
                <div className={styles.textBlock}>
                    <h2>Quality First</h2>
                    <p>
                        We believe great clothes shouldn&apos;t cost a fortune. By working directly with our
                        manufacturers and keeping our operations lean, we deliver premium quality at fair prices.
                    </p>
                    <p>
                        From the stitching to the fabric, every detail matters. We test everything ourselves
                        before it reaches you.
                    </p>
                </div>
                <div className={styles.imageBlock}>
                    <img
                        src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop"
                        alt="Quality Materials"
                    />
                </div>
            </section>

            <section className={styles.values}>
                <div className={styles.valueCard}>
                    <h3>Free Shipping</h3>
                    <p>On all orders over $100. Fast, reliable delivery to your door.</p>
                </div>
                <div className={styles.valueCard}>
                    <h3>Easy Returns</h3>
                    <p>30-day hassle-free returns. No questions asked.</p>
                </div>
                <div className={styles.valueCard}>
                    <h3>Secure Checkout</h3>
                    <p>Your payment information is always protected.</p>
                </div>
            </section>
        </div>
    )
}
