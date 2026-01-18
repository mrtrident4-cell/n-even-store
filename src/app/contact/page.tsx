import styles from './contact.module.css'
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Contact Us</h1>
                <p className={styles.subtitle}>We&apos;re here to help you with anything you need.</p>
            </header>

            <div className={styles.grid}>
                <div className={styles.info}>
                    <div className={styles.card}>
                        <div className={styles.icon}><Mail /></div>
                        <h3>Email Us</h3>
                        <p>General Inquiries: hello@neven.com</p>
                        <p>Support: support@neven.com</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.icon}><Phone /></div>
                        <h3>Call Us</h3>
                        <p>Main Office: +91 98765 43210</p>
                        <p>Working Hours: Mon-Fri, 9am - 6pm</p>
                    </div>
                    <div className={styles.card}>
                        <div className={styles.icon}><MapPin /></div>
                        <h3>Visit Us</h3>
                        <p>123 Fashion District, HSR Layout</p>
                        <p>Bangalore, Karnataka, India</p>
                    </div>
                </div>

                <div className={styles.formSection}>
                    <form className={styles.form}>
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>First Name</label>
                                <input type="text" placeholder="John" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Last Name</label>
                                <input type="text" placeholder="Doe" />
                            </div>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Email Address</label>
                            <input type="email" placeholder="john@example.com" />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Subject</label>
                            <select>
                                <option>General Inquiry</option>
                                <option>Order Status</option>
                                <option>Returns & Exchanges</option>
                                <option>Product Feedback</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Message</label>
                            <textarea rows={6} placeholder="How can we help you?"></textarea>
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Send Message <MessageSquare size={18} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
